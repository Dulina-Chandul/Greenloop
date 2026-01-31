import { Navigate, Outlet, useLocation } from "react-router";
import { Loader2 } from "lucide-react";

import userAuth from "@/hooks/userAuth";
import UserMenu from "./UserMenu";

const AppContainer = () => {
  const { user, isLoading } = userAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return user ? (
    <div className="min-h-screen w-full bg-background p-4">
      <UserMenu />
      <Outlet />
    </div>
  ) : (
    <Navigate
      to="/login"
      replace
      state={{
        redirectUrl: location.pathname,
      }}
    />
  );
};

export default AppContainer;
