import { act, renderHook, waitFor } from "@testing-library/react";
import { useAddNotes } from "../reactQuery/notes/useAddNotes";
import { useFetchNotes } from "../reactQuery/notes/useFetchNotes";
import { useDeleteNote } from "../reactQuery/notes/useDeleteNote";
import { useEditNote } from "../reactQuery/notes/useEditNote";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import API from "../axiosInstance/axiosInstance";
import { INote } from "../types/note";

jest.mock("../axiosInstance/axiosInstance");
const mockedAPI = API as jest.Mocked<typeof API>;


const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("React query Note custom useHooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fakeNote: INote = {
    _id: "1",
    title: "Test Note",
    content: "Test content",
    imageUrl: "https://example.com/image.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

   it("fetches notes successfully", async () => {
    mockedAPI.get.mockResolvedValueOnce({ data: [fakeNote] });

    const { result } = renderHook(() => useFetchNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual([fakeNote]);
    });
  });

  it("adds a note successfully",  async() => {
    const newNote = {
      title: "New Note",
      content: "New content",
      imageUrl: "https://example.com/new.jpg",
    };


     mockedAPI.post.mockResolvedValueOnce({ data: fakeNote });

    const { result } = renderHook(() => useAddNotes(), { wrapper });

   
  await  act(async() => {
      result.current.mutate(newNote);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedAPI.post).toHaveBeenCalledWith("/create", newNote);
  });



 it("deletes a note by ID", async () => {
    mockedAPI.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteNote(), { wrapper });

  await  act(async() => {
      result.current.mutate("1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedAPI.delete).toHaveBeenCalledWith("/1");
  });

  it("edits a note by ID", async () => {
    const update = {
      title: "Updated Note",
      content: "Updated Content",
      imageUrl: "https://example.com/updated.jpg",
    };

    mockedAPI.put.mockResolvedValueOnce({ data: { ...fakeNote, ...update } });

    const { result } = renderHook(() => useEditNote(), { wrapper });

   await act(async() => {
      result.current.mutate({ id: "1", note: update });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedAPI.put).toHaveBeenCalledWith("/edit/1", update);
  });
});
