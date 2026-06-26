import Card from "../components/Card";
import Button from "../components/Button";
import InputField from "../components/InputField";

function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <Card>
        <h1 className="text-4xl font-bold text-center text-blue-600">
          AI Interview Platform
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Welcome Back
        </p>

        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        <div className="mt-6">
          <Button text="Login" />
        </div>

        <p className="text-center mt-5">
          Don't have an account?
          <span className="text-blue-600 cursor-pointer">
            {" "}
            Register
          </span>
        </p>
      </Card>
    </div>
  );
}

export default Login;