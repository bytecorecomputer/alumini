import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { checkMonthlyFeeReminders } from "../../lib/feeAutomation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user data from Firestore
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
              // Refresh data
              snap = await getDoc(userRef);
              data = snap.data();
              console.log("Auto-promoted owner to Super Admin");
            }

            if (snap.exists()) {
              setRole(data?.role);
              setUserData(data);

              // Trigger Fee Audit for Admins on Login
              if (data?.role === 'admin' || data?.role === 'super_admin') {
                checkMonthlyFeeReminders();
              }
            } else {
              // User exists in Auth but not Firestore (e.g. registration partially failed)
              console.warn("User authenticated but no profile found in Firestore");
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
    <AuthContext.Provider value={{ user, role, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
