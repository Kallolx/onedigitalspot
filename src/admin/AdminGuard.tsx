import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await account.get();
        // Check if user has 'admin' label/role
        const labels = user.labels || user.prefs?.labels || [];
        setIsAdmin(Array.isArray(labels) && labels.includes("admin"));
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminGuard;