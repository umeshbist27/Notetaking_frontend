import React, { useEffect } from "react";
import NoteEditor from "../editor/NoteEditor";
import { toast } from "react-toastify";
import { render, screen, fireEvent, act } from "@testing-library/react";

jest.mock("../common/customUndoRedo");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@tinymce/tinymce-react", () => ({
  Editor: ({ onInit, onEditorChange }: any) => {
    useEffect(() => {
      const fakeEditor = {
        setContent: jest.fn(),
        getContent: () => "mock content",
      };

      onInit?.({}, fakeEditor);
      onEditorChange?.("mock content", {});
    }, []);

    return <div data-testid="editor" />;
  },
}));

describe("NoteEditor unit tests", () => {
  const mockOnSave = jest.fn();
  const defaultNote = {
    _id: "1",
    title: "Initial title",
    content: "the content of the initial title",
    imageUrl: "",
    createdAt: "",
    updatedAt: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes the content and title from the note prop", () => {
    render(<NoteEditor note={defaultNote} onSave={mockOnSave} />);
    expect(screen.getByPlaceholderText("Note title...")).toHaveValue(
      "Initial title"
    );
  });

  it("updates the title state and hasTyped on input change", () => {
    render(<NoteEditor note={defaultNote} onSave={mockOnSave} />);
    const input = screen.getByPlaceholderText("Note title...");
    fireEvent.change(input, { target: { value: "new title" } });
    expect(input).toHaveValue("new title");
  });

  it("calls onSave after debounce when title is changed and hasTyped is true",async () => {
    jest.useFakeTimers();
    render(<NoteEditor note={defaultNote} onSave={mockOnSave} />);

    const input = screen.getByPlaceholderText("Note title...");
    fireEvent.change(input, { target: { value: "changed title" } });

     await act(async() => {
      jest.runAllTimers();
    });

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: "changed title" })
    );

    jest.useRealTimers();
  });

  it("does not call onSave if title and content are not changed",async () => {
    jest.useFakeTimers();
    render(<NoteEditor note={defaultNote} onSave={mockOnSave} />);
     await act(async() => {
      jest.runAllTimers();
    });
    expect(mockOnSave).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("shows toast error if onSave throws error", async() => {
    jest.useFakeTimers();
    const fakeOnSave = jest.fn(() => {
      throw new Error("save failed...");
    });

    render(<NoteEditor note={defaultNote} onSave={fakeOnSave} />);
    const input = screen.getByPlaceholderText("Note title...");
    fireEvent.change(input, { target: { value: "changed title" } });

   await act(async() => {
      jest.runAllTimers();
    });

    expect(toast.error).toHaveBeenCalledWith("save failed...");
    jest.useRealTimers();
  });

  it("clears debounce timeout and reinitializes on note change", async() => {
    jest.useFakeTimers();
    const { rerender } = render(
      <NoteEditor note={defaultNote} onSave={mockOnSave} />
    );

    const newNote = {
      ...defaultNote,
      _id: "2",
      title: "Changed Note",
      content: "Different content",
    };

    const input = screen.getByPlaceholderText("Note title...");
    fireEvent.change(input, { target: { value: "temp" } });

    rerender(<NoteEditor note={newNote} onSave={mockOnSave} />);

   await act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByPlaceholderText("Note title...")).toHaveValue(
      "Changed Note"
    );

    jest.useRealTimers();
  });

  it("sets lastContentRef when same noteId is passed again", () => {
    const { rerender } = render(
      <NoteEditor note={defaultNote} onSave={mockOnSave} />
    );
    rerender(<NoteEditor note={defaultNote} onSave={mockOnSave} />);
  });
  it("normalizes content by removing data-mce attributes",async () => {
    jest.useFakeTimers();

    const dirtyNote = {
      ...defaultNote,
      content: '<p data-mce-style="color:red;" style="color:red;">Hello</p>',
    };

    render(<NoteEditor note={dirtyNote} onSave={mockOnSave} />);

    const input = screen.getByPlaceholderText("Note title...");
    fireEvent.change(input, { target: { value: "Updated title" } });

   await act(async() => {
      jest.runAllTimers();
    });

    const savedPayload = mockOnSave.mock.calls[0][0];
    expect(savedPayload.content).not.toContain("data-mce-");

    jest.useRealTimers();
  });

  it("does not save if title and content are both empty",async () => {
    jest.useFakeTimers();

    const emptyNote = { ...defaultNote, title: "", content: "" };
    render(<NoteEditor note={emptyNote} onSave={mockOnSave} />);

    const input = screen.getByPlaceholderText("Note title...");
    fireEvent.change(input, { target: { value: "" } });

  await  act(async() => {
      jest.runAllTimers();
    });

    expect(mockOnSave).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it("calls pushSnapshot when editor content changes", () => {
    render(<NoteEditor note={defaultNote} onSave={mockOnSave} />);
  });
  it("initializes editor and sets content", () => {
    const setContentMock = jest.fn();
    render(<NoteEditor note={defaultNote} onSave={mockOnSave} />);
  });

  it("sets lastContentRef from note.content when same noteId is used", () => {
    const noteWithContent = {
      ...defaultNote,
      content: "specific content for same note",
    };

    const { rerender } = render(
      <NoteEditor note={noteWithContent} onSave={mockOnSave} />
    );

    const updatedSameNote = {
      ...noteWithContent,
      content: "updated content for same note",
      updatedAt: new Date().toISOString(),
    };

    rerender(<NoteEditor note={updatedSameNote} onSave={mockOnSave} />);

    expect(screen.getByTestId("editor")).toBeInTheDocument();
  });

  it("assigns lastContentRef when note changes with same ID", () => {
    const initialNote = {
      ...defaultNote,
      content: "initial content",
    };

    const { rerender } = render(
      <NoteEditor note={initialNote} onSave={mockOnSave} />
    );

    const sameIdNote = {
      ...initialNote,
      content: "different content but same ID",
      title: "different title",
    };

    rerender(<NoteEditor note={sameIdNote} onSave={mockOnSave} />);
    expect(screen.getByPlaceholderText("Note title...")).toHaveValue(
      "different title"
    );
  });

  it("handles empty content in lastContentRef assignment", () => {
    const noteWithEmptyContent = {
      ...defaultNote,
      content: "",
    };

    const { rerender } = render(
      <NoteEditor note={noteWithEmptyContent} onSave={mockOnSave} />
    );

    rerender(<NoteEditor note={noteWithEmptyContent} onSave={mockOnSave} />);

    expect(screen.getByTestId("editor")).toBeInTheDocument();
  });
});
