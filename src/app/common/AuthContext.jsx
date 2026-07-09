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
    const studentRef = doc(db, "students", student.registration);
    const unsub = onSnapshot(studentRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStudent(prev => ({ ...prev, ...data }));
      }
    });
    return () => unsub();
  }, [student?.registration]);

  const logoutStudent = async () => {
    await signOut(auth);
    setStudent(null);
  };

  const logoutUser = async () => {
    await signOut(auth);
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
        console.log("User data refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
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
              // Might be a student logged in via Custom Token
              const studentRef = doc(db, "students", u.uid);
              const studentSnap = await getDoc(studentRef);
              
              if (studentSnap.exists()) {
                setStudent(studentSnap.data());
                setUser(null);
                setUserData(null);
                setRole('student');
              } else {
                setUser(u);
                setUserData({});
              }
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData({});
          }
        } else {
          setUser(null);
          setRole(null);
          setUserData(null);
          setStudent(null);
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
      logoutStudent,
      logoutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
