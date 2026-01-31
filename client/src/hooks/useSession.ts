import { getSessionsAPI } from "@/apiservices/common/commonAPI";
import { useQuery } from "@tanstack/react-query";

export const SESSIONS = "sessions";

const useSession = (opts = {}) => {
  const { data: sessions = [], ...rest } = useQuery({
    queryKey: [SESSIONS],
    queryFn: () => getSessionsAPI(),
    ...opts,
  });

  return { sessions, ...rest };
};

export default useSession;
