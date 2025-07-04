import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Login from "../pages/Login";

jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../config', () => ({
  VITE_API: 'http://mock-api:3000/api/auth/notes',
}));

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));


const mockedAxios = axios as jest.Mocked<typeof axios>;

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

 it("toggles password visibility when eye icon is clicked", () => {
  renderWithRouter(<Login />);
  const passwordInput = screen.getByPlaceholderText("********") as HTMLInputElement;
  const toggleButton = screen.getByTestId("toggle-password");

  expect(passwordInput.type).toBe("password");

  fireEvent.click(toggleButton);
  expect(passwordInput.type).toBe("text");

  fireEvent.click(toggleButton);
  expect(passwordInput.type).toBe("password");
});

it("navigates to signup page when clicking 'Sign up'", () => {
  renderWithRouter(<Login />);
  const signupLink = screen.getByText("Sign up");
  fireEvent.click(signupLink);
  expect(mockedNavigate).toHaveBeenCalledWith("/signup");
});


  it("renders email and password fields", () => {
    renderWithRouter(<Login />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("logs in successfully and stores token", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: "fake-token",
        name: "Umesh",
      },
    });

    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://mock-api:3000/api/auth/notes/login",
        {
          email: "test@example.com",
          password: "password123",
        }
      );
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(localStorage.getItem("username")).toBe("Umesh");
      expect(toast.success).toHaveBeenCalledWith("Logged in successfully");
    });
  });

  it("shows error toast on login failure", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Invalid credentials"));

    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Login failed. Please check your credentials."
      );
    });
  });

  it("matches the snapshot", () => {
    const { asFragment } = renderWithRouter(<Login />);
    expect(asFragment()).toMatchSnapshot();
  });
});
