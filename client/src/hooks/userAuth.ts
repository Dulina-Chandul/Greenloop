import { useQuery } from "@tanstack/react-query";
import { getUserAPI } from "../apiservices/common/commonAPI";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
} from "@/redux/slices/authSlice";

export const AUTH = "auth";

const userAuth = (opts = {}) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const reduxUser = useAppSelector(selectUser);
  const userRole = useAppSelector(selectUserRole);

  const { data: apiUser, ...rest } = useQuery({
    queryKey: [AUTH],
    queryFn: () => getUserAPI(dispatch),
    staleTime: Infinity,
    enabled: isAuthenticated,
    ...opts,
  });

  const user = apiUser?.user || reduxUser;

  return {
    user: user ? { ...user, role: userRole } : null,
    isAuthenticated,
    userRole,
    ...rest,
  };
};

export default userAuth;
