import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";
import { collection, getDocs, doc, setDoc, getDoc, query, where } from "firebase/firestore";
import { sendTelegramNotification } from "./telegram";
import { calculateCourseExpiry, parseDateToYYYYMM } from "./utils";

/**
 * Automatically cleans up any corrupted or legacy installments (e.g. Total Fee ₹6000, S.No, Roll No, Mobile No, or amounts < 50)
 * from student object to ensure 100% clean financial ledger calculations.
 */
/**
 * Automatically cleans up any corrupted or legacy installments (e.g. Total Fee ₹6000, S.No, Roll No, Mobile No, or amounts < 50)
 * from student object to ensure 100% clean financial ledger calculations.
 */
export function sanitizeStudentData(student) {
    if (!student) return student;

    let rawTotal = parseInt(String(student.totalFees ?? student.totalFee ?? 0).replace(/[^0-9.]/g, ''), 10);
    if (isNaN(rawTotal) || rawTotal > 50000 || rawTotal < 0) {
        rawTotal = 6000;
    }

    let admissionFee = parseInt(String(student.admissionFee ?? student.registrationFee ?? 0).replace(/[^0-9.]/g, ''), 10);
    if (isNaN(admissionFee) || admissionFee > 5000) admissionFee = 200;

    const regIdNum = parseInt(String(student.registration || student.regNo || '').replace(/\D/g, ''), 10);
    const mobileNum = parseInt(String(student.mobile || student.mob || '').replace(/\D/g, ''), 10);

    let rawInsts = Array.isArray(student.installments) ? student.installments : [];

    // Filter out metadata artifacts (Roll No, S.No, Mobile No, Total Fee duplicates)
    const validInsts = rawInsts.filter(inst => {
        const amtStr = String(inst.amount || inst.amountDisplay || '').replace(/[^0-9.]/g, '');
        const amt = parseInt(amtStr || 0, 10);
        if (isNaN(amt) || amt < 50 || amt > 30000) return false;
        if (rawTotal > 0 && amt === rawTotal && rawInsts.length > 1) return false;
        if (regIdNum > 0 && amt === regIdNum) return false;
        if (mobileNum > 0 && amt === mobileNum) return false;
        return true;
    });

    // Deduplicate by unique amount + date
    const uniqueMap = new Map();
    validInsts.forEach(inst => {
        const amtStr = String(inst.amount || inst.amountDisplay || '').replace(/[^0-9.]/g, '');
        const amt = parseInt(amtStr || 0, 10);
        const dt = inst.date || inst.dateDisplay || '';
        const key = `${amt}_${dt}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
                ...inst,
                amount: amt,
                date: dt,
                dateDisplay: dt
            });
        }
    });

    const cleanInsts = Array.from(uniqueMap.values()).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    cleanInsts.forEach((inst, idx) => {
        inst.installmentNo = idx + 1;
    });

    const cleanPaidSum = cleanInsts.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
    const cleanPaidFees = Math.min(cleanPaidSum, rawTotal);

    return {
        ...student,
        course: student.course || student.trade || 'N/A',
        mobile: student.mobile || student.mob || '',
        totalFees: rawTotal,
        totalFee: rawTotal,
        admissionFee: admissionFee,
        registrationFee: admissionFee,
        installments: cleanInsts,
        paidFees: cleanPaidFees,
        totalPaid: cleanPaidFees,
        balanceDue: Math.max(0, rawTotal - cleanPaidFees)
    };
}

/**
 * Intelligent Fee Reminder Algorithm
 * High Level logic to detect which students' monthly fee is due today,
 * and generates a Monthly Fee Performance Report.
 */
export const checkMonthlyFeeReminders = async (targetStudentId = null, forceSend = false) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser && !targetStudentId) {
            console.log("Fee Audit: Skipping (unauthenticated).");
            return;
        }

        console.log(`Initializing Intelligent Fee Audit${targetStudentId ? ` for Reg: ${targetStudentId}` : "..."}`);

        const todayStr = new Date().toISOString().split('T')[0];
        const metaRef = doc(db, "metadata", "last_fee_check");

        if (!targetStudentId) {
            const metaSnap = await getDoc(metaRef);
            if (metaSnap.exists() && metaSnap.data().date === todayStr) {
                console.log("Fee audit already completed for today.");
            }
        }

        let snapshot;
        if (targetStudentId) {
            const q = query(collection(db, "students"), where("registration", "==", targetStudentId.toString()));
            snapshot = await getDocs(q);
        } else {
            snapshot = await getDocs(collection(db, "students"));
        }
        
        const studentsDue = [];
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        let report_paidThisMonth = 0;
        let report_pendingThisMonth = 0;
        const studentsPendingThisMonth = [];

        snapshot.forEach((studentDoc) => {
            const rawData = studentDoc.data();
            const data = sanitizeStudentData(rawData);

            if (data.status === 'pass') return;

            const expiryInfo = calculateCourseExpiry(data);
            if (expiryInfo && expiryInfo.isCompleted) return;

            const registrationFee = data.registrationFee ? Number(data.registrationFee) : 0;
            const totalCourseFee = Number(data.totalFees || 0);
            const totalPayable = totalCourseFee + registrationFee;
            const totalPaid = (data.paidFees || 0) + (data.oldPaidFees || 0);
            const pendingBalance = Math.max(0, totalPayable - totalPaid);

            if (pendingBalance <= 0) return;

            const currentMonthPrefix = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
            const hasPaidThisMonth = data.installments?.some(inst => {
                if (!inst.date) return false;
                const formatted = parseDateToYYYYMM(inst.date);
                return formatted === currentMonthPrefix;
            });

            if (hasPaidThisMonth) {
                const paidAmtThisMonth = data.installments
                    .filter(inst => parseDateToYYYYMM(inst.date) === currentMonthPrefix)
                    .reduce((sum, i) => sum + Number(i.amount || 0), 0);
                report_paidThisMonth += paidAmtThisMonth;
            } else {
                report_pendingThisMonth += Math.min(pendingBalance, 1000);
                studentsPendingThisMonth.push({
                    name: data.fullName || 'Student',
                    reg: data.registration,
                    mobile: data.mobile || 'N/A',
                    course: data.course || 'N/A',
                    pending: pendingBalance,
                    center: data.center || 'Main'
                });
            }
        });

        if (forceSend || (studentsPendingThisMonth.length > 0 && !targetStudentId)) {
            await sendTelegramNotification('fee_report', {
                month: monthNames[currentMonth - 1],
                year: currentYear,
                totalPendingCount: studentsPendingThisMonth.length,
                pendingAmount: report_pendingThisMonth,
                paidAmount: report_paidThisMonth,
                pendingStudents: studentsPendingThisMonth.slice(0, 15)
            });

            if (!targetStudentId) {
                await setDoc(metaRef, { date: todayStr, timestamp: Date.now() });
            }
        }

        return {
            success: true,
            pendingCount: studentsPendingThisMonth.length,
            pendingAmount: report_pendingThisMonth,
            paidAmount: report_paidThisMonth
        };

    } catch (err) {
        console.error("Error running fee reminders:", err);
        return { success: false, error: err.message };
    }
};
