import { useQuery } from "@tanstack/react-query"
import API from "../../axiosInstance/axiosInstance"
import { INote } from "../../types/note";




export const useFetchNotes=()=>{
    return useQuery<INote[]>({
        queryKey:['notes'] as const,
        retry:false,
        queryFn:async ()=>{
            const {data}=await API.get<INote[]>('/note');
            return data;
        }
    })
}