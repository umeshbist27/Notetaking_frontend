import {
  requestInterceptor,
  requestInterceptorError,
  responseInterceptorSuccess,
  responseInterceptorError,
} from "../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('../config', () => ({
  VITE_API: 'http://mock-api:3000/api/auth/notes',
}));

describe("Axios Interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("adds Authorization header if token exists", () => {
    localStorage.setItem("token", "mocked-token");
    const config = { headers: {} };
    const result = requestInterceptor(config as any);
    expect(result.headers.Authorization).toBe("Bearer mocked-token");
  });

  it("passes request interceptor error through", async () => {
    const error = new Error("Request error");
    await expect(requestInterceptorError(error as any)).rejects.toThrow(
      "Request error"
    );
  });

  it("passes response through on success", () => {
    const response = { data: "success" };
    const result = responseInterceptorSuccess(response);
    expect(result).toBe(response);
  });

  it("calls toast.error with message on response error", async () => {
    const error = {
      response: { data: { message: "Invalid token" } },
      message: "Network Error",
    };
    await expect(responseInterceptorError(error as any)).rejects.toEqual(error);
    expect(toast.error).toHaveBeenCalledWith("Invalid token");
  });

  it("calls toast.error with generic message if no response data", async () => {
    const error = {
      message: "Request failed",
    };
    await expect(responseInterceptorError(error as any)).rejects.toEqual(error);
    expect(toast.error).toHaveBeenCalledWith("Request failed");
  });
  it("does not add Authorization header if token is missing", () => {
  const config = { headers: {} };
  const result = requestInterceptor(config as any);
  expect(result.headers.Authorization).toBeUndefined();
});

it("does not throw if config.headers is missing", () => {
  const config = {}; 
  const result = requestInterceptor(config as any);
  expect(result).toEqual(config);
});
it("calls toast.error with default message if no message or response data", async () => {
  const error = {}; 
  await expect(responseInterceptorError(error as any)).rejects.toEqual(error);
  expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred");
});
});
