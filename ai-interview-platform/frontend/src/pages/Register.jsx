import { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import InputField from "../components/InputField";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    console.log(formData);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert("Registration Successful!");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <Card>
        <h1 className="text-4xl font-bold text-center text-blue-600">
          Create Account
        </h1>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            type="text"
            placeholder="Enter your name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />

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
            placeholder="Enter password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <div className="mt-6">
            <Button text="Register" />
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Register;