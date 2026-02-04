// src/pages/common/UserMenu.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { LogOut, User, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/apiservices/common/commonAPI";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { selectUser, selectUserRole } from "@/redux/slices/authSlice";

const UserMenu = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userRole = useAppSelector(selectUserRole);

  const { mutate: signOut } = useMutation({
    mutationFn: () => logout(dispatch),
    onSettled: () => {
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  const dashboardRoute =
    userRole === "collector" ? "/collector/dashboard" : "/seller/dashboard";

  const profileRoute =
    userRole === "collector" ? "/collector/profile" : "/seller/profile";

  const settingsRoute =
    userRole === "collector" ? "/collector/settings" : "/seller/settings";

  const initials = user?.email?.charAt(0).toUpperCase() || "GL";

  return (
    <div className="absolute bottom-6 left-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer transition-opacity hover:opacity-80">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src="#" alt="User" />
              <AvatarFallback className="bg-green-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="end" className="w-56 ml-2">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => navigate(dashboardRoute)}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate(profileRoute)}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate(settingsRoute)}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => signOut()}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
