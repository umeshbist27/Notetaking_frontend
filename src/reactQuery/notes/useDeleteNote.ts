
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../axiosInstance/axiosInstance";




export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (id: string) => API.delete(`api/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes'] as any);
    },
  });
};