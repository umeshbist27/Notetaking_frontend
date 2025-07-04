import { toast } from "react-toastify";
import axios from "axios";
import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../validation/authValidation";
import { Formik, ErrorMessage, Field, Form } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { VITE_API } from "../config";

interface formValue{
  email:String,
  password:String
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values:formValue, { resetForm, setSubmitting }: any) => {
    try {
      const res = await axios.post(
        `${VITE_API}api/auth/login`,
        values
      );
      localStorage.setItem("token", res.data.token);

      localStorage.setItem("username", res.data.name);

      resetForm();

      toast.success(`Logged in successfully`);
      navigate("/notes");
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Error occurred", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500">
          Please log in to your account
        </p>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={handleSubmit}
          validationSchema={loginSchema}
          validateOnChange={true}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  autoComplete="current-email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />

                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                ></label>
                <Field
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="********"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
                />
                <div
                  data-testid="toggle-password"
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg font-semibold transition duration-300"
              >
                Login
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-gray-700 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
