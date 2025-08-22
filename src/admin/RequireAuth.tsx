import { useEffect, useState, ReactNode } from "react";
import { account } from "@/lib/appwrite";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: ReactNode;
  requiredRoles?: string[]; // optional roles to check against user.labels
}

const RequireAuth = ({ children, requiredRoles }: Props) => {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const user = await account.get();
        if (!mounted) return;
        setIsAuthed(true);

        if (requiredRoles && requiredRoles.length > 0) {
          const labels = user.labels || user.prefs?.labels || [];
          const ok = Array.isArray(labels) && requiredRoles.every((r) => labels.includes(r));
          setHasRole(ok);
        } else {
          setHasRole(true); // no role required
        }
      } catch (err) {
        if (!mounted) return;
        setIsAuthed(false);
        setHasRole(false);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [requiredRoles]);

  // still checking
  if (isAuthed === null || hasRole === null) return <div>Loading...</div>;

  // not authenticated -> redirect to login, preserving attempted path
  if (!isAuthed) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }

  // authenticated but lacks role
  if (!hasRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
