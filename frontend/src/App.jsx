import { Link, Navigate, Route, Routes } from "react-router-dom";
import Home from "./Home.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Workspace from "./components/Workspace.jsx";
import "./App.css";

function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">Page not found</p>
      <h1>This page is outside the classroom.</h1>
      <Link className="button button-primary" to="/">Back to home</Link>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/workspace/:role/:section?/:resourceId?" element={<Workspace />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
