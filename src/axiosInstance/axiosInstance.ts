import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { VITE_API } from "../config";

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const requestInterceptorError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error);
};

export const responseInterceptorSuccess = (response: any) => response;

export const responseInterceptorError = (error: AxiosError) => {
  let message = "An unexpected error occurred";

  if (
    error.response?.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    message = (error.response.data as any).message;
  } else if (error.message) {
    message = error.message;
  }
  toast.error(message);
  return Promise.reject(error);
};

const API = axios.create({
  baseURL: VITE_API,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(requestInterceptor, requestInterceptorError);
API.interceptors.response.use(responseInterceptorSuccess, responseInterceptorError);

export default API;
