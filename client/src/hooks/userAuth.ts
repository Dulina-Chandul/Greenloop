import { useQuery } from "@tanstack/react-query";
import { getUserAPI } from "../apiservices/common/commonAPI";

export const AUTH = "auth";

const userAuth = (opts = {}) => {
  const { data: user, ...rest } = useQuery({
    queryKey: [AUTH],
    queryFn: getUserAPI,
    staleTime: Infinity,
    ...opts,
  });

  return { user, ...rest };
};

export default userAuth;
