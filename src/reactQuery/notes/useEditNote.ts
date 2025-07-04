import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../axiosInstance/axiosInstance";
import { INote } from "../../types/note";

export const useEditNote = () => {
  const queryClient = useQueryClient();

  return useMutation<INote, unknown, { id: string; note: Partial<INote> }>({
    mutationFn: ({ id, note }) =>
      API.put(`/edit/${id}`, note).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"] as any);
    },
  });
};
