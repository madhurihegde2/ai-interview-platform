import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <Link to="/dashboard" className="text-xl font-bold">
          AI Interview Platform
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
