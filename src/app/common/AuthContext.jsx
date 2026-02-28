import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { checkMonthlyFeeReminders } from "../../lib/feeAutomation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Student Session on Init
  useEffect(() => {
    const session = localStorage.getItem('student_session');
    if (session) {
      try {
        setStudent(JSON.parse(session));
      } catch (err) {
        localStorage.removeItem('student_session');
      }
    }
  }, []);

  // Sync Student Firestore for Real-time updates if student is logged in
  useEffect(() => {
    if (!student?.registration) return;
    const studentRef = doc(db, "students", student.registration);
    const unsub = onSnapshot(studentRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStudent(prev => ({ ...prev, ...data }));
        localStorage.setItem('student_session', JSON.stringify(data));
      }
    });
    return () => unsub();
  }, [student?.registration]);

  const loginStudent = (data) => {
    setStudent(data);
    localStorage.setItem('student_session', JSON.stringify(data));
  };

  const logoutStudent = () => {
    setStudent(null);
    localStorage.removeItem('student_session');
  };

  // Function to refresh user data (Admin/Staff) from Firestore
  const refreshUserData = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setRole(data?.role);
        setUserData(data);
        console.log("User data refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          try {
            const userRef = doc(db, "users", u.uid);
            let snap = await getDoc(userRef);
            let data = snap.data();

            // SUPER ADMIN AUTO-PROMOTION SITE OWNER
            if (u.email === "coderafroj@gmail.com" && data?.role !== "super_admin") {
              await updateDoc(userRef, { role: "super_admin" });
              snap = await getDoc(userRef);
              data = snap.data();
            }

            if (snap.exists()) {
              setRole(data?.role);
              setUserData(data);

              if (data?.role === 'admin' || data?.role === 'super_admin') {
                checkMonthlyFeeReminders();
              }
            } else {
              setUserData({});
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData({});
          }
          setUser(u);
        } else {
          setUser(null);
          setRole(null);
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{
      user, role, userData,
      student, isStudent: !!student,
      loading,
      refreshUserData,
      loginStudent,
      logoutStudent
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
