import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HistoryTable from "../components/HistoryTable";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.reverse());
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch history");
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <nav className="bg-white rounded shadow mb-6 max-w-2xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded font-semibold hover:bg-blue-100 focus:bg-blue-200 text-blue-700"
            style={{ background: '#e0e7ff' }}
            onClick={() => navigate('/dashboard')}
          >
            API
          </button>
          <button
            className="px-4 py-2 rounded font-semibold hover:bg-blue-100 focus:bg-blue-200 text-blue-700"
            onClick={() => {}} // User tab placeholder
            disabled
            style={{ opacity: 0.6 }}
          >
            User
          </button>
          <button
            className="px-4 py-2 rounded font-semibold hover:bg-blue-100 focus:bg-blue-200 text-blue-700"
            onClick={() => navigate('/history')}
          >
            History
          </button>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            navigate("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>
      <div className="bg-white rounded shadow p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">API Call History</h2>
        <HistoryTable history={history} />
      </div>
    </div>
  );
};

export default History;
