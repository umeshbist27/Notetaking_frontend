import React from "react";
import { render, screen } from "@testing-library/react";
import NotesLayout from "../pages/NoteLayout";
import { MemoryRouter } from "react-router-dom";

let mockUseNoteHandlersReturn: any = {
  notes: [],
  activeNote: { _id: "1", title: "Note", content: "Hello" },
  isSidebarOpen: true,
  handleDelete: jest.fn(),
  handleSaveNote: jest.fn(),
  handleSelectNote: jest.fn(),
  handleAddNote: jest.fn(),
  toggleSidebar: jest.fn(),
  handleOverlayClick: jest.fn(),
};

jest.mock("../hooks/useNoteHandlers", () => ({
  useNoteHandlers: () => mockUseNoteHandlersReturn,
}));

describe("NotesLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders NoteEditor when activeNote is present", () => {
    mockUseNoteHandlersReturn.activeNote = {
      _id: "1",
      title: "Test Note",
      content: "Some content",
    };

    render(
      <MemoryRouter>
        <NotesLayout />
      </MemoryRouter>
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders rightHeaderContent button when sidebar is closed and activeNote exists", () => {
  mockUseNoteHandlersReturn.isSidebarOpen = false;
  mockUseNoteHandlersReturn.activeNote = {
    _id: "1",
    title: "Note Title",
    content: "Note Content",
  };

  render(
    <MemoryRouter>
      <NotesLayout />
    </MemoryRouter>
  );
  expect(screen.getByTestId("right-header-toggle")).toBeInTheDocument();

});

  it("shows fallback message when no active note", () => {
    mockUseNoteHandlersReturn.activeNote = null;

    render(
      <MemoryRouter>
        <NotesLayout />
      </MemoryRouter>
    );

    expect(screen.getByText("Select a note to view.")).toBeInTheDocument();
  });

  it("renders sidebar if isSidebarOpen is true", () => {
    mockUseNoteHandlersReturn.isSidebarOpen = true;

    render(
      <MemoryRouter>
        <NotesLayout />
      </MemoryRouter>
    );

    
    expect(screen.getByRole("button", { name: /add note/i })).toBeInTheDocument();
  });

  it("does not render overlay or sidebar toggle button when sidebar is closed", () => {
    mockUseNoteHandlersReturn.isSidebarOpen = false;

    render(
      <MemoryRouter>
        <NotesLayout />
      </MemoryRouter>
    );

    const overlay = screen.queryByTestId("sidebar-overlay");
    expect(overlay).not.toBeInTheDocument();

    
    const toggleButton = screen.queryByRole("button", { name: /open sidebar/i });
    expect(toggleButton).not.toBeInTheDocument();
  });
});
