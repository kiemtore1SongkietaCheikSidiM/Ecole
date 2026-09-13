import { Navigate} from "react-router-dom";
type RoleProtectedProps = {
  roles: string[];
  children: React.ReactNode;
};

export function ProtectedRoute({ roles, children }: RoleProtectedProps) {
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}