import { deleteSessionAPI } from "../apiservices/common/commonAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SESSIONS } from "./useSession";

const useDeleteSession = (id: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, ...rest } = useMutation({
    mutationFn: () => deleteSessionAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SESSIONS],
      });
    },
  });

  return { deleteSession: mutateAsync, ...rest };
};

export default useDeleteSession;
