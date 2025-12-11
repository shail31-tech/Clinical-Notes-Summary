import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import NoteDetailPage from "./pages/NoteDetailPage";

function App() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/notes/:noteId" element={<NoteDetailPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
