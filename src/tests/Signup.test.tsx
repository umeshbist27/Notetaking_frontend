import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import Signup from "../pages/Signup";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { toast } from "react-toastify";

const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: jest.fn(),
  };
});
jest.mock('../config', () => ({
  VITE_API: 'http://mock-api:3000/',
}));
jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};
describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all input fields and button", () => {
    renderWithRouter(<Signup />);
    expect(screen.getByPlaceholderText("Enter Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("navigates to login page when 'Login' link is clicked", async () => {
  const navigateMock = jest.fn();
  (useNavigate as jest.Mock).mockReturnValue(navigateMock);

  renderWithRouter(<Signup />);

  const loginLink = screen.getByText("Login");
  await userEvent.click(loginLink);

  expect(navigateMock).toHaveBeenCalledWith("/login");
});


  it("toggles password visibility", async () => {
    renderWithRouter(<Signup />);
    const passwordInput = screen.getByPlaceholderText("********");

    const toggle = screen.getByTestId("toggle-password");
    expect(passwordInput).toHaveAttribute("type", "password");

    await userEvent.click(toggle);

    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("shows error toast if email already exists", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { exists: true } });

    renderWithRouter(<Signup />);

    await userEvent.type(screen.getByPlaceholderText("Enter Name"), "Umesh");
    await userEvent.type(
      screen.getByPlaceholderText("Enter Email"),
      "umesh@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("********"), "Strong@123");

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://mock-api:3000/api/auth/check-email",
      { params: { email: "umesh@example.com" } }
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Email already exist,Please use different Email"
    );
  });

  it("submits form and shows success toast on valid signup", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { exists: false } });
    mockedAxios.post.mockResolvedValueOnce({});

    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);

    renderWithRouter(<Signup />);

    await userEvent.type(screen.getByPlaceholderText("Enter Name"), "Umesh");
    await userEvent.type(
      screen.getByPlaceholderText("Enter Email"),
      "umesh@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("********"), "Strong@123");

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://mock-api:3000/api/auth/signup",
      {
        name: "Umesh",
        email: "umesh@example.com",
        password: "Strong@123",
      }
    );
    expect(toast.success).toHaveBeenCalledWith("signup successfully");
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("shows error toast if signup API fails", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { exists: false } });
    mockedAxios.post.mockRejectedValueOnce(new Error("Signup failed"));

    renderWithRouter(<Signup />);

    await userEvent.type(screen.getByPlaceholderText("Enter Name"), "Umesh");
    await userEvent.type(
      screen.getByPlaceholderText("Enter Email"),
      "umesh@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("********"), "Strong@123");

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Signup failed. Please try again."
    );
  });
});
