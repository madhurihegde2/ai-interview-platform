import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, UserPlus } from "lucide-react";

import Button from "../components/ui/Button";
import { FieldError, Input, Label } from "../components/ui/Input";
import PasswordInput from "../components/PasswordInput";
import { registerUser } from "../api/authApi";
import { useToast } from "../context/toast";

const MIN_PASSWORD_LENGTH = 8;

function validate({ fullName, email, password, confirmPassword }) {
  const errors = {};

  if (!fullName.trim()) errors.fullName = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email address.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";

  return errors;
}

function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const errors = validate(formData);
  const showErrors = touched ? errors : {};

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    setError("");

    if (Object.keys(errors).length > 0) return;

    try {
      setIsLoading(true);

      await registerUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success("Account created. Log in to get started.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Start practicing interviews in minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Jane Doe"
            value={formData.fullName}
            onChange={handleChange}
            invalid={Boolean(showErrors.fullName)}
          />
          <FieldError>{showErrors.fullName}</FieldError>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            invalid={Boolean(showErrors.email)}
          />
          <FieldError>{showErrors.email}</FieldError>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            value={formData.password}
            onChange={handleChange}
            invalid={Boolean(showErrors.password)}
          />
          <FieldError>{showErrors.password}</FieldError>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            invalid={Boolean(showErrors.confirmPassword)}
          />
          <FieldError>{showErrors.confirmPassword}</FieldError>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isLoading} icon={UserPlus}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Log in
        </Link>
      </p>
    </>
  );
}

export default Register;
