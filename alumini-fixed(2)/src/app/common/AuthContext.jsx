/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { checkMonthlyFeeReminders } from "../../lib/feeAutomation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Student Firestore for Real-time updates if student is logged in
  useEffect(() => {
    if (!student?.registration) return;
    try {
      const studentRef = doc(db, "students", student.registration);
      const unsub = onSnapshot(studentRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setStudent(prev => ({ ...prev, ...data }));
        }
      }, (err) => {
        console.warn('[AuthContext] Student live snapshot listener notice:', err.message);
      });
      return () => unsub();
    } catch (e) {
      console.warn('[AuthContext] Snapshot init notice:', e.message);
    }
  }, [student?.registration]);

  const loginStudent = (studentData) => {
    if (!studentData) return;
    const safeData = {
      ...studentData,
      registration: studentData.registration || studentData.id || studentData.regNo,
      fullName: studentData.fullName || studentData.name || 'Student'
    };
    setStudent(safeData);
    setUser(null);
    setUserData(null);
    setRole('student');
    // Store in local storage to persist complete student session
    try {
      localStorage.setItem('studentSession', JSON.stringify({
        registration: safeData.registration,
        studentData: safeData,
        savedAt: Date.now()
      }));
    } catch (err) {
      console.warn('[AuthContext] localStorage save warning:', err);
    }
  };

  const logoutStudent = async () => {
    try { await signOut(auth); } catch (_) {}
    setStudent(null);
    setRole(null);
    try { localStorage.removeItem('studentSession'); } catch (_) {}
  };

  const logoutUser = async () => {
    try { await signOut(auth); } catch (_) {}
    setUser(null);
    setUserData(null);
    setRole(null);
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
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  useEffect(() => {
    // 1. Immediately hydrate student session from localStorage (instant, 0ms latency)
    try {
      const storedSession = localStorage.getItem('studentSession');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed?.studentData) {
          setStudent(parsed.studentData);
          setRole('student');
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn('[AuthContext] Initial session check notice:', e);
    }

    // 2. Firebase Auth observer
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          try {
            const userRef = doc(db, "users", u.uid);
            let snap = await getDoc(userRef);

            if (snap.exists()) {
              let data = snap.data();
              setRole(data?.role);
              setUserData(data);
              setUser(u);
              setStudent(null);

              if (data?.role === 'admin' || data?.role === 'super_admin') {
                checkMonthlyFeeReminders();
              }
            } else {
              // Might be a student logged in via Custom Token or Anonymous
              const studentRef = doc(db, "students", u.uid);
              try {
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                  const data = studentSnap.data();
                  setStudent(prev => ({ ...(prev || {}), ...data }));
                  setUser(null);
                  setUserData(null);
                  setRole('student');
                } else {
                  // Check localStorage student session
                  const stored = localStorage.getItem('studentSession');
                  if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed?.studentData) {
                      setStudent(parsed.studentData);
                      setRole('student');
                    }
                  } else {
                    setUser(u);
                    setUserData({});
                  }
                }
              } catch (_) {
                // If student doc read was blocked by rules, check cached session
                const stored = localStorage.getItem('studentSession');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (parsed?.studentData) {
                    setStudent(parsed.studentData);
                    setRole('student');
                  }
                }
              }
            }
          } catch (error) {
            console.warn("Error fetching user doc:", error);
          }
        } else {
          setUser(null);
          setUserData(null);

          // Check for persisted student session if no Firebase user
          const storedSession = localStorage.getItem('studentSession');
          if (storedSession) {
            try {
              const parsed = JSON.parse(storedSession);
              if (parsed?.studentData) {
                setStudent(parsed.studentData);
                setRole('student');
              } else if (parsed?.registration) {
                const studentRef = doc(db, "students", parsed.registration);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                  setStudent(studentSnap.data());
                  setRole('student');
                }
              }
            } catch (err) {
              console.warn("Error recovering student session:", err);
            }
          }
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
      logoutStudent,
      logoutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
