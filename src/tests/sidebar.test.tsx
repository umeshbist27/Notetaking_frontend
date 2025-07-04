import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Sidebar from "../components/Sidebar";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("react-toastify", () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("../common/SearchNote", () => (props: any) => (
  <input
    placeholder="Search..."
    value={props.searchTitle}
    onChange={(e) => props.setSearchTitle(e.target.value)}
    onKeyDown={(e) => props.handleKeyDown(e)}
  />
));

jest.mock("../common/DeletePopup", () => (props: any) => (
  <button data-testid="delete-popup" onClick={props.onDelete}>🗑</button>
));

describe("Sidebar minimal tests", () => {
  const mockNotes = [
    {
      _id: "1",
      title: "Test Note",
      content: "<p>Hello</p>",
      imageUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const baseProps = {
    activeNote: mockNotes[0],
    notes: mockNotes,
    onDelete: jest.fn(),
    onAddClick: jest.fn(),
    onNoteClick: jest.fn(),
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.setItem("username", "TestUser");
    localStorage.setItem("token", "mock-token");
    jest.clearAllMocks();
  });

  it("renders username and notes", () => {
    render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("calls onAddClick when 'Add Note' is clicked", () => {
    render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText(/add note/i));
    expect(baseProps.onAddClick).toHaveBeenCalled();
  });

  it("calls onNoteClick when a note is clicked", () => {
    render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText("Test Note"));
    expect(baseProps.onNoteClick).toHaveBeenCalledWith(mockNotes[0]);
  });

  it("calls onDelete when delete icon clicked", () => {
    render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByTestId("delete-popup"));
    expect(baseProps.onDelete).toHaveBeenCalledWith("1");
  });

  it("shows fallback if no notes", () => {
    render(
      <Sidebar {...baseProps} notes={[]} activeNote={null} />,
      { wrapper: MemoryRouter }
    );
    expect(screen.getByText("No notes available")).toBeInTheDocument();
  });

  it("shows toast when search has no matches", async () => {
    const { toast } = require("react-toastify");

    render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Note not matched");
    });
  });

  it("logout clears token if confirmed", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByTestId("logout-button"));

    expect(confirmSpy).toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/"); // Confirm it navigates to "/"
  });

  it("sorts notes by updatedAt descending", () => {
    const olderDate = new Date(Date.now() - 100000).toISOString();
    const newerDate = new Date().toISOString();

    const notes = [
      { _id: "1", title: "Older Note", content: "", imageUrl:"", updatedAt: olderDate, createdAt: olderDate },
      { _id: "2", title: "Newer Note", content: "", imageUrl:"", updatedAt: newerDate, createdAt: newerDate },
    ];

    render(<Sidebar {...baseProps} notes={notes} />, { wrapper: MemoryRouter });

    const noteTitles = screen.getAllByTestId("note-title");
    expect(noteTitles[0]).toHaveTextContent("Newer Note");
    expect(noteTitles[1]).toHaveTextContent("Older Note");
  });

  it("navigates to /notes when logout is cancelled", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByTestId("logout-button"));

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/notes");
  });

  it("updates searchTitle when Enter key is pressed", () => {
    render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "Test" } });
    fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });
  });

  it("renders 'Untitled Note' if title is missing", () => {
    const untitledNote = {
      _id: "2",
      title: "",
      content: "<p>Blank title</p>",
      imageUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <Sidebar {...baseProps} notes={[untitledNote]} activeNote={untitledNote} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText("Untitled Note")).toBeInTheDocument();
  });

  it("calls handleKeyDown on Enter key press", async () => {
  render(<Sidebar {...baseProps} />, { wrapper: MemoryRouter });

  const searchInput = screen.getByPlaceholderText("Search...");
  fireEvent.change(searchInput, { target: { value: "Some note" } });

  fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

  
  await waitFor(() => {
   
  });
});


});
