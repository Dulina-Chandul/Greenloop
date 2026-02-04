import { Navigate, useLocation } from "react-router";

import { Loader2 } from "lucide-react";
import userAuth from "@/hooks/userAuth";
import { useAppSelector } from "@/redux/hooks/hooks";
import {
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
  type UserRole,
} from "@/redux/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireVerified?: boolean;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  requireVerified = false,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRole = useAppSelector(selectUserRole);
  const user = useAppSelector(selectUser);
  const { isLoading } = userAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirectUrl: location.pathname,
        }}
      />
    );
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          requiredRole: allowedRoles,
          currentRole: userRole,
        }}
      />
    );
  }

  if (requireVerified && !user?.verified) {
    return (
      <Navigate
        to="/verify-email-required"
        replace
        state={{
          redirectUrl: location.pathname,
        }}
      />
    );
  }

  return <>{children}</>;
};
