import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";
import { collection, getDocs, doc, setDoc, getDoc, query, where } from "firebase/firestore";
import { sendTelegramNotification } from "./telegram";
import { calculateCourseExpiry, parseDateToYYYYMM } from "./utils";

/**
 * Intelligent Fee Reminder Algorithm
 * High Level logic to detect which students' monthly fee is due today,
 * and generates a Monthly Fee Performance Report.
 */
export const checkMonthlyFeeReminders = async (targetStudentId = null) => {
    try {
        // 1. Authentication Guard
        const currentUser = auth.currentUser;
        if (!currentUser && !targetStudentId) {
            console.log("Fee Audit: Skipping (unauthenticated).");
            return;
        }

        console.log(`Initializing Intelligent Fee Audit${targetStudentId ? ` for Reg: ${targetStudentId}` : "..."}`);

        // 2. Avoid duplicate checks for the same day (Global Audit only)
        const todayStr = new Date().toISOString().split('T')[0];
        const metaRef = doc(db, "metadata", "last_fee_check");

        if (!targetStudentId) {
            const metaSnap = await getDoc(metaRef);
            if (metaSnap.exists() && metaSnap.data().date === todayStr) {
                console.log("Fee audit already completed for today.");
                // We still might want to run it manually if triggered from admin
                // return;
            }
        }

        let snapshot;
        if (targetStudentId) {
            // Precise check for single student
            const q = query(collection(db, "students"), where("registration", "==", targetStudentId.toString()));
            snapshot = await getDocs(q);
        } else {
            // Full collection for bulk audit
            snapshot = await getDocs(collection(db, "students"));
        }
        
        const studentsDue = [];
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const currentMonthYYYYMM = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        let report_paidThisMonth = 0;
        let report_pendingThisMonth = 0;
        const studentsPendingThisMonth = [];

        snapshot.forEach((studentDoc) => {
            const data = studentDoc.data();

            // Ignore passed out students
            if (data.status === 'pass') return;

            // Check Expiry Logic
            const expiryInfo = calculateCourseExpiry(data);
            if (expiryInfo && expiryInfo.isCompleted) {
                return; // Ignore students whose course duration is over
            }

            const totalPaid = (data.paidFees || 0) + (data.oldPaidFees || 0);
            const balance = (Number(data.totalFees) || 0) - totalPaid;
            
            // If they are fully paid, they don't owe anything this month or ever
            // Special Rule: If totalFees == 500, they are scholarship/free students. 
            // Once they pay 500, balance is <= 0, so they are safely ignored here.
            if (balance <= 0) return;

            // --- DEEP ALGORITHM START ---

            // Check if they paid in the current calendar month
            const hasPaidThisMonth = data.installments?.some(inst => {
                const instMonth = parseDateToYYYYMM(inst.date);
                return instMonth === currentMonthYYYYMM;
            });

            if (hasPaidThisMonth) {
                report_paidThisMonth++;
            } else {
                report_pendingThisMonth++;
                studentsPendingThisMonth.push({
                    fullName: data.fullName,
                    registration: data.registration,
                    balance
                });
            }

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
            const lastDay = lastInteraction.getDate();
            const lastMonthNum = lastInteraction.getMonth() + 1;
            const lastYear = lastInteraction.getFullYear();
            const monthDiff = (currentYear - lastYear) * 12 + (currentMonth - lastMonthNum);

            if (monthDiff >= 1) {
                const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
                const targetDay = Math.min(lastDay, daysInCurrentMonth);

                if (currentDay === targetDay) {
                    // Final Check: Ensure they haven't ALREADY paid in the current target month
                    if (!hasPaidThisMonth) {
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

        // Broadcast Daily Reminders
        if (studentsDue.length > 0) {
            console.log(`Audited: ${studentsDue.length} students are due for fees today.`);
            let studentListText = '';
            
            // For huge lists, limit text to avoid Telegram 4096 char limit
            const maxList = studentsDue.slice(0, 20);
            
            maxList.forEach((s, i) => {
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

            if (studentsDue.length > 20) studentListText += `\n...and ${studentsDue.length - 20} more.`;

            await sendTelegramNotification('bulk_fee_reminder', {
                count: studentsDue.length,
                studentList: studentListText
            });
        }
        
        // Broadcast Monthly Performance Report
        // Only run this globally (not for a specific student)
        if (!targetStudentId) {
            console.log(`Monthly Report: ${report_paidThisMonth} Paid, ${report_pendingThisMonth} Pending`);
            
            let pendingListText = '';
            const maxPendingList = studentsPendingThisMonth.slice(0, 30);
            maxPendingList.forEach((s, i) => {
                pendingListText += `${i + 1}. ${s.fullName} (Reg: ${s.registration}) - Bal: ₹${s.balance}\n`;
            });
            if (studentsPendingThisMonth.length > 30) pendingListText += `...and ${studentsPendingThisMonth.length - 30} more.\n`;
            if (pendingListText === '') pendingListText = '🎉 All active students have paid!';

            await sendTelegramNotification('monthly_fee_report', {
                monthStr: `${monthNames[currentMonth - 1]} ${currentYear}`,
                paidCount: report_paidThisMonth,
                pendingCount: report_pendingThisMonth,
                pendingList: pendingListText
            });
        }

        // 4. Finalize
        if (!targetStudentId) {
            await setDoc(metaRef, { date: todayStr, count: studentsDue.length });
        }

    } catch (err) {
        console.error("Fee Automation Error:", err);
    }
};
