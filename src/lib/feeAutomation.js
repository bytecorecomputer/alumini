import { db } from "../firebase/firestore";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { sendTelegramNotification } from "./telegram";

/**
 * Intelligent Fee Reminder Algorithm
 * High Level logic to detect which students' monthly fee is due today.
 */
export const checkMonthlyFeeReminders = async () => {
    try {
        console.log("Initializing Intelligent Fee Audit...");

        // 1. Avoid duplicate checks for the same day
        const todayStr = new Date().toISOString().split('T')[0];
        const metaRef = doc(db, "metadata", "last_fee_check");
        const metaSnap = await getDoc(metaRef);

        // If already checked today, skip (uncomment for production)
        // if (metaSnap.exists() && metaSnap.data().date === todayStr) {
        //     console.log("Fee audit already completed for today.");
        //     return;
        // }

        const snapshot = await getDocs(collection(db, "students"));
        const studentsDue = [];
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        snapshot.forEach((studentDoc) => {
            const data = studentDoc.data();

            // Skip passed out or fully paid students
            const totalPaid = (data.paidFees || 0) + (data.oldPaidFees || 0);
            const balance = (data.totalFees || 0) - totalPaid;
            if (data.status === 'pass' || balance <= 0) return;

            // --- DEEP ALGORITHM START ---

            // 1. Helper to parse mixed date formats (YYYY-MM-DD or DD/MM/YYYY)
            const parseToDate = (str) => {
                if (!str || str === 'N/A') return null;
                if (str.includes('-')) return new Date(str); // ISO
                if (str.includes('/')) {
                    const [d, m, y] = str.split('/');
                    return new Date(`${y}-${m}-${d}`);
                }
                return null;
            };

            // 2. Determine Timeline Reference (Admission or Last Installment)
            let lastInteraction = parseToDate(data.admissionDate);
            let lastInteractionType = "Admission";

            if (data.installments && data.installments.length > 0) {
                // Find the absolute latest installment date
                data.installments.forEach(inst => {
                    const instDate = parseToDate(inst.date);
                    if (instDate && (!lastInteraction || instDate > lastInteraction)) {
                        lastInteraction = instDate;
                        lastInteractionType = "Last Payment";
                    }
                });
            }

            if (!lastInteraction || isNaN(lastInteraction.getTime())) return;

            // 3. Logic: Is Today exactly 1 month (or more) after the last interaction?
            // We trigger if: today.day === last.day (with month-end normalization) 
            // AND (today.month > last.month OR today.year > last.year)
            const lastDay = lastInteraction.getDate();
            const lastMonth = lastInteraction.getMonth() + 1;
            const lastYear = lastInteraction.getFullYear();

            // Check if at least 1 calendar month has passed
            const monthDiff = (currentYear - lastYear) * 12 + (currentMonth - lastMonth);

            if (monthDiff >= 1) {
                // Day of month matching logic
                const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
                const targetDay = Math.min(lastDay, daysInCurrentMonth);

                if (currentDay === targetDay) {
                    // Final Check: Ensure they haven't ALREADY paid in the current target month
                    // (To avoid double alerts if they paid exactly on their due date today)
                    const alreadyPaidToday = data.installments?.some(inst => {
                        const d = parseToDate(inst.date);
                        return d && d.getDate() === currentDay && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
                    });

                    if (!alreadyPaidToday) {
                        studentsDue.push({
                            ...data,
                            balance,
                            lastInteractionType,
                            lastInteractionDate: lastInteraction.toLocaleDateString('en-GB'),
                            dueDate: `${targetDay}/${currentMonth}/${currentYear}`
                        });
                    }
                }
            }
            // --- DEEP ALGORITHM END ---
        });

        if (studentsDue.length > 0) {
            console.log(`Audited: ${studentsDue.length} students are due for fees today.`);

            // Format for professional bulk report
            let studentListText = '';
            studentsDue.forEach((s, i) => {
                studentListText += `${i + 1}. <b>${s.fullName}</b> (Reg: ${s.registration})\n   💰 Bal: ₹${s.balance} | 📅 ${s.lastInteractionType}: ${s.lastInteractionDate}\n\n`;

                // Also send individual alert for high-priority tracking
                sendTelegramNotification('fee_reminder', {
                    fullName: s.fullName,
                    registration: s.registration,
                    mobile: s.mobile,
                    course: s.course,
                    balance: s.balance,
                    dueDate: s.dueDate,
                    lastInteractionType: s.lastInteractionType,
                    lastInteractionDate: s.lastInteractionDate
                });
            });

            // Send Daily Summary
            await sendTelegramNotification('bulk_fee_reminder', {
                count: studentsDue.length,
                studentList: studentListText
            });
        }

        // Update last check date
        await setDoc(metaRef, { date: todayStr, count: studentsDue.length });

    } catch (err) {
        console.error("Fee Automation Error:", err);
    }
};
