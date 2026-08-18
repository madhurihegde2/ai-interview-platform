import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Card from "../components/Card";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { loginUser } from "../api/authApi";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await loginUser(formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <Card>
        <h1 className="text-4xl font-bold text-center text-blue-600">
          AI Interview Platform
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Welcome Back
        </p>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6">
            <Button
              text={isLoading ? "Logging in..." : "Login"}
              disabled={isLoading}
            />
          </div>
        </form>

        <p className="text-center mt-5">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;