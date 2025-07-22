import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiBody, setApiBody] = useState("");
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Navigation Bar */}
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
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      {/* API Tester Section */}
      <div className="bg-white rounded shadow p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Test Third-Party Product Security API</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">API URL</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="เช่น https://dogapi.dog/api/v2/breeds"
          />
          <div className="text-xs text-gray-500 mt-1">ตัวอย่าง: https://dogapi.dog/api/v2/breeds</div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">API Token (optional)</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={apiToken}
            onChange={e => setApiToken(e.target.value)}
            placeholder="เช่น eyJhbGciOiJIUzI1NiIsInR5cCI6..."
          />
          <div className="text-xs text-gray-500 mt-1">ตัวอย่าง: eyJhbGciOiJIUzI1NiIsInR5cCI6...</div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Method</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={apiMethod}
            onChange={e => setApiMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <div className="text-xs text-gray-500 mt-1">ตัวอย่าง: GET (สำหรับดึงข้อมูล), POST (สำหรับส่งข้อมูล)</div>
        </div>
        {apiMethod !== "GET" && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">Request Body (JSON)</label>
            <textarea
              className="w-full border px-3 py-2 rounded font-mono"
              rows={4}
              value={apiBody}
              onChange={e => setApiBody(e.target.value)}
              placeholder='{"name": "Doggy", "age": 2}'
            />
            <div className="text-xs text-gray-500 mt-1">ตัวอย่าง: {'{"name": "Doggy", "age": 2}'}</div>
          </div>
        )}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={apiLoading || !apiUrl}
          onClick={async () => {
            setApiLoading(true);
            setApiError("");
            setApiResponse(null);
            try {
              // Build headers
              const headers: Record<string, string> = {};
              if (apiToken) headers["Authorization"] = `Bearer ${apiToken}`;
              if (apiMethod !== "GET" && apiBody) headers["Content-Type"] = "application/json";
              // Always use backend proxy
              const res = await fetch("/api/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  url: apiUrl,
                  method: apiMethod,
                  headers,
                  body: apiMethod !== "GET" ? apiBody : undefined,
                }),
              });
              const contentType = res.headers.get("content-type");
              let data;
              if (contentType && contentType.includes("application/json")) {
                data = await res.json();
                setApiResponse(JSON.stringify(data, null, 2));
              } else {
                data = await res.text();
                setApiResponse(data);
              }
            } catch {
              setApiError("API request failed");
            } finally {
              setApiLoading(false);
            }
          }}
        >
          {apiLoading ? "Loading..." : "Send Request"}
        </button>
        {apiError && <div className="mt-2 text-red-500">{apiError}</div>}
        {apiResponse && (
          <div className="mt-4">
            <label className="block mb-1 font-medium">Response</label>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">{apiResponse}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
