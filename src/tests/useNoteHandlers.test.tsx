import { act, renderHook } from "@testing-library/react";
import { useNoteHandlers } from "../hooks/useNoteHandlers";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUseFetchNotes = jest.fn();
const mockUseAddNotes = jest.fn();
const mockUseEditNote = jest.fn();
const mockUseDeleteNote = jest.fn();

jest.mock("../reactQuery/notes/useFetchNotes", () => ({
  useFetchNotes: () => mockUseFetchNotes(),
}));
jest.mock("../reactQuery/notes/useAddNotes", () => ({
  useAddNotes: () => mockUseAddNotes(),
}));
jest.mock("../reactQuery/notes/useEditNote", () => ({
  useEditNote: () => mockUseEditNote(),
}));
jest.mock("../reactQuery/notes/useDeleteNote", () => ({
  useDeleteNote: () => mockUseDeleteNote(),
}));

describe("tests for all the actions save delete edit ...", () => {
  const navigateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFetchNotes.mockReturnValue({ data: [] });
    mockUseAddNotes.mockReturnValue({ mutate: jest.fn() });
    mockUseEditNote.mockReturnValue({ mutate: jest.fn() });
    mockUseDeleteNote.mockReturnValue({ mutate: jest.fn() });

    localStorage.clear();
  });

  it("sets active note to first sorted note if none selected", () => {
    const notes = [
      {
        _id: "1",
        title: "A",
        content: "a",
        imageUrl: "",
        createdAt: "2025-06-01",
        updatedAt: "2025-06-02",
      },
      {
        _id: "2",
        title: "B",
        content: "b",
        imageUrl: "",
        createdAt: "2025-06-02",
        updatedAt: "2025-06-03",
      },
    ];
    mockUseFetchNotes.mockReturnValue({ data: notes });

    const { result } = renderHook(() => useNoteHandlers(navigateMock));

    expect(result.current.activeNote?._id).toBe("2");
  });

  it("calls deleteNoteMutation.mutate and toast on delete",async () => {
    const mutateMock = jest.fn();
    mockUseDeleteNote.mockReturnValue({ mutate: mutateMock });

    const { result } = renderHook(() => useNoteHandlers(navigateMock));

  await  act(async() => {
      result.current.handleDelete("123");
    });

    expect(mutateMock).toHaveBeenCalledWith("123", expect.any(Object));
  });

  it("does not save empty note",async () => {
    const addMutate = jest.fn();
    const editMutate = jest.fn();
    mockUseAddNotes.mockReturnValue({ mutate: addMutate });
    mockUseEditNote.mockReturnValue({ mutate: editMutate });

    const { result } = renderHook(() => useNoteHandlers(navigateMock));

   await act(async() => {
      result.current.handleSaveNote({
        _id: null,
        title: "   ",
        content: "   ",
        imageUrl: "",
        createdAt: "",
        updatedAt: "",
      });
    });

    expect(addMutate).not.toHaveBeenCalled();
    expect(editMutate).not.toHaveBeenCalled();
  });

  it("calls editNoteMutation on save if note has _id",async () => {
    const editMutate = jest.fn();
    mockUseEditNote.mockReturnValue({ mutate: editMutate });

    const note = {
      _id: "123",
      title: "Title",
      content: "Content",
      imageUrl: "url",
      createdAt: "",
      updatedAt: "",
    };

    const { result } = renderHook(() => useNoteHandlers(navigateMock));

   await act(async() => {
      result.current.handleSaveNote(note);
    });

    expect(editMutate).toHaveBeenCalledWith({
      id: "123",
      note: {
        title: "Title",
        content: "Content",
        imageUrl: "url",
      },
    });
  });

  it("calls addNoteMutation on save if note has no _id",async () => {
    const addMutate = jest.fn();
    mockUseAddNotes.mockReturnValue({ mutate: addMutate });

    const note = {
      _id: null,
      title: "Title",
      content: "Content",
      imageUrl: "url",
      createdAt: "",
      updatedAt: "",
    };

    const { result } = renderHook(() => useNoteHandlers(navigateMock));

  await  act(async() => {
      result.current.handleSaveNote(note);
    });

    expect(addMutate).toHaveBeenCalledWith({
      title: "Title",
      content: "Content",
      imageUrl: "url",
    });
  });

  it("handles handleSelectNote and handleAddNote",async () => {
    const { result } = renderHook(() => useNoteHandlers(navigateMock));

  await  act(async() => {
      result.current.handleSelectNote({
        _id: "1",
        title: "Test",
        content: "Test",
        imageUrl: "",
        createdAt: "",
        updatedAt: "",
      });
    });
    expect(result.current.activeNote?._id).toBe("1");

  await  act(async() => {
      result.current.handleAddNote();
    });
    expect(result.current.activeNote?._id).toBeNull();
  });
  it("sets activeNote to null when notes list is empty", () => {
    mockUseFetchNotes.mockReturnValue({ data: [] });

    const { result } = renderHook(() => useNoteHandlers(navigateMock));

    expect(result.current.activeNote).toBeNull();
  });

  it("sets activeNote to most recently updated note when no activeNote exists", () => {
    const notes = [
      {
        _id: "1",
        title: "Old Note",
        content: "Old Content",
        imageUrl: "",
        createdAt: "2025-06-01",
        updatedAt: "2025-06-01",
      },
      {
        _id: "2",
        title: "New Note",
        content: "New Content",
        imageUrl: "",
        createdAt: "2025-06-02",
        updatedAt: "2025-06-05",
      },
    ];

    mockUseFetchNotes.mockReturnValue({ data: notes });

    const { result } = renderHook(() => useNoteHandlers(navigateMock));

    expect(result.current.activeNote?._id).toBe("2");
  });

  it("keeps the current activeNote if it's up-to-date",async () => {
    const notes = [
      {
        _id: "1",
        title: "Note",
        content: "Same Content",
        imageUrl: "",
        createdAt: "2025-06-01",
        updatedAt: "2025-06-02",
      },
    ];

    mockUseFetchNotes.mockReturnValue({ data: notes });

    const { result } = renderHook(() => useNoteHandlers(navigateMock));

   await act(async() => {
      result.current.handleSelectNote(notes[0]);
    });

    expect(result.current.activeNote?._id).toBe("1");
  });

  it("updates activeNote if current one has outdated content/title", async() => {
    const updatedNote = {
      _id: "1",
      title: "Updated Title",
      content: "Updated Content",
      imageUrl: "",
      createdAt: "2025-06-01",
      updatedAt: "2025-06-02",
    };

    const outdatedNote = {
      _id: "1",
      title: "Old Title",
      content: "Old Content",
      imageUrl: "",
      createdAt: "2025-06-01",
      updatedAt: "2025-06-02",
    };

    mockUseFetchNotes.mockReturnValue({ data: [updatedNote] });

    const { result, rerender } = renderHook(() =>
      useNoteHandlers(navigateMock)
    );

   await act(async() => {
      result.current.handleSelectNote(outdatedNote);
    });

    mockUseFetchNotes.mockReturnValue({ data: [updatedNote] });
    rerender();

    expect(result.current.activeNote?.title).toBe("Updated Title");
  });
});
describe("additional edge cases for useNoteHandlers", () => {
  const navigateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFetchNotes.mockReturnValue({ data: [] });
    mockUseAddNotes.mockReturnValue({ mutate: jest.fn() });
    mockUseEditNote.mockReturnValue({ mutate: jest.fn() });
    mockUseDeleteNote.mockReturnValue({ mutate: jest.fn() });
    localStorage.clear();

    
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });


  it("handleDelete calls onSuccess callback and toast, closes sidebar if width < 1024",async () => {
    const mutateMock = jest.fn();
    mockUseDeleteNote.mockReturnValue({ mutate: mutateMock });
    window.innerWidth = 800;

    const { result } = renderHook(() => useNoteHandlers(navigateMock));
  await  act(async() => {
      result.current.handleDelete("123");
    });

    expect(mutateMock).toHaveBeenCalledWith("123", expect.objectContaining({
      onSuccess: expect.any(Function),
    }));
    const onSuccess = mutateMock.mock.calls[0][1].onSuccess;
  await  act(async() => onSuccess());

    expect(toast.success).toHaveBeenCalledWith("Note deleted successfully");
    expect(result.current.isSidebarOpen).toBe(false);
  });

  it("handleSelectNote closes sidebar if width < 1024",async () => {
    window.innerWidth = 800;
    const { result } = renderHook(() => useNoteHandlers(navigateMock));
  await  act(async() => {
      result.current.handleSelectNote({
        _id: "1",
        title: "Test",
        content: "Test",
        imageUrl: "",
        createdAt: "",
        updatedAt: "",
      });
    });
    expect(result.current.isSidebarOpen).toBe(false);
  });

  it("handleAddNote closes sidebar if width < 1024",async () => {
    window.innerWidth = 800;
    const { result } = renderHook(() => useNoteHandlers(navigateMock));
   await act(async() => {
      result.current.handleAddNote();
    });
    expect(result.current.isSidebarOpen).toBe(false);
    expect(result.current.activeNote?._id).toBeNull();
  });

  it("toggleSidebar toggles sidebar open/close state",async () => {
    const { result } = renderHook(() => useNoteHandlers(navigateMock));
    const initial = result.current.isSidebarOpen;
   await act(async() => {
      result.current.toggleSidebar();
    });
    expect(result.current.isSidebarOpen).toBe(!initial);
   await act(async() => {
      result.current.toggleSidebar();
    });
    expect(result.current.isSidebarOpen).toBe(initial);
  });

  it("handleOverlayClick sets sidebar closed", async() => {
    const { result } = renderHook(() => useNoteHandlers(navigateMock));
   await act(async() => {
      result.current.handleOverlayClick();
    });
    expect(result.current.isSidebarOpen).toBe(false);
  });
});


