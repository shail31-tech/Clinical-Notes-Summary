import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg">
          Clinical Notes LLM Assistant
        </Link>
        <nav className="space-x-4 text-sm">
          <Link to="/">Dashboard</Link>
          <Link to="/upload">Upload Note</Link>
        </nav>
      </div>
    </header>
  );
}
