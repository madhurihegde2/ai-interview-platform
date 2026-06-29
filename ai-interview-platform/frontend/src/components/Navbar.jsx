import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">
          AI Interview Platform
        </h1>

        <div className="space-x-6">
          <Link to="/">Login</Link>

          <Link to="/register">Register</Link>

          <Link to="/dashboard">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;