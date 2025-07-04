import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../axiosInstance/axiosInstance";
import { INote } from "../../types/note";

export const useAddNotes = () => {
  const queryClient = useQueryClient();

  return useMutation<INote, unknown, Partial<INote>>({
    mutationFn: (noteData) =>
      API.post("/create", noteData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"] as any);
    },
  });
};
