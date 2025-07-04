import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeletePopup from "../common/DeletePopup";


jest.mock("sweetalert2", () => {
  return {
    __esModule: true,
    default: class Swal {
      static fire:any = jest.fn(() => Promise.resolve({ isConfirmed: true }));
    },
  };
});


jest.mock("sweetalert2-react-content", () => {
  const Swal = require("sweetalert2").default;
  return () => Swal;
});

describe("DeletePopup", () => {
  it("renders delete button", () => {
    render(<DeletePopup onDelete={jest.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls Swal.fire on button click", async () => {
    const Swal = require("sweetalert2").default;
    render(<DeletePopup onDelete={jest.fn()} />);
    await userEvent.click(screen.getByRole("button"));
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      })
    );
  });

  it("calls onDelete if confirmed", async () => {
    const onDelete = jest.fn();
    render(<DeletePopup onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("does not call onDelete if not confirmed", async () => {
    const Swal = require("sweetalert2").default;
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });

    const onDelete = jest.fn();
    render(<DeletePopup onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onDelete).not.toHaveBeenCalled();
  });
});