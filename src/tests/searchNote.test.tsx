import { render, screen, fireEvent } from "@testing-library/react";
import SearchNote from "../common/SearchNote";

describe("SearchNote", () => {
  const mockSetSearchTitle = jest.fn();
  const mockHandleKeyDown = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the  input with value on input", () => {
    render(
      <SearchNote
        searchTitle="test"
        setSearchTitle={mockSetSearchTitle}
        handleKeyDown={mockHandleKeyDown}
      />
    );

    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("test");
  });

  it("calls setSearchTitle on input change", () => {
    render(
      <SearchNote
        searchTitle=""
        setSearchTitle={mockSetSearchTitle}
        handleKeyDown={mockHandleKeyDown}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "hello" },
    });

    expect(mockSetSearchTitle).toHaveBeenCalledWith("hello");
  });

  it("calls handleKeyDown on key press", () => {
    render(
      <SearchNote
        searchTitle=""
        setSearchTitle={mockSetSearchTitle}
        handleKeyDown={mockHandleKeyDown}
      />
    );

    fireEvent.keyDown(screen.getByPlaceholderText("Search..."), {
      key: "Enter",
    });

    expect(mockHandleKeyDown).toHaveBeenCalled();
  });
});
