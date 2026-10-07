
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./App.css";

function App() {

    const [token, setToken] = useState(
    localStorage.getItem("access_token") || ""
  );

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    product: "Laptop",
    region: "North",
    quantity: 10,
    price: 50000,
    marketing_spend: 5000,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
const [regionFilter, setRegionFilter] = useState("All");

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

   useEffect(() => {
  if (token) {
    loadHistory(currentPage);
  }
}, [currentPage, token]);


const exportToCSV = () => {
  if (filteredHistory.length === 0) {
    alert("No prediction history available to export.");
    return;
  }

  const headers = [
    "ID",
    "Product",
    "Region",
    "Quantity",
    "Predicted Sales",
  ];

  const rows = filteredHistory.map((item) => [
    item.id,
    item.product,
    item.region,
    item.quantity,
    item.predicted_sales,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "sales_prediction_history.csv";
  link.click();

  URL.revokeObjectURL(url);
};

const filteredHistory = history.filter((item) => {
  const query = searchTerm.trim().toLowerCase();

  const matchesSearch =
    String(item.product || "").toLowerCase().includes(query) ||
    String(item.region || "").toLowerCase().includes(query);

  const matchesRegion =
    regionFilter === "All" || item.region === regionFilter;

  const itemDate = item.created_at
    ? item.created_at.slice(0, 10)
    : "";

  const matchesStartDate =
    !startDate || (itemDate && itemDate >= startDate);

  const matchesEndDate =
    !endDate || (itemDate && itemDate <= endDate);

  return (
    matchesSearch &&
    matchesRegion &&
    matchesStartDate &&
    matchesEndDate
  );
});



  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: ["quantity", "price", "marketing_spend"].includes(name)
        ? value
        : value,
    }));
  }

  async function predictSales(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const params = new URLSearchParams(form);

      params.append("token", token);

      
      
      const response = await fetch(
  `http://127.0.0.1:8000/predict?${params.toString()}`,
  {
    method: "POST",
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed");
      }

      setResult(data);
      loadHistory();
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Backend se connection nahi ho raha. Check karo ki FastAPI server running hai."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  
async function loadHistory(page = 1) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/history?page=${page}&page_size=20&token=${encodeURIComponent(token)}`
    );

    if (!response.ok) {
      throw new Error("History load nahi hui");
    }

    const data = await response.json();
    setHistory(data.records);
    setTotalRecords(data.total_records);
  } catch {
    setHistory([]);
  }
}

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    const username = event.target.username.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/register"
          ,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setShowRegister(false);
      setError("");
      alert("Account created successfully! Please login.");
    } catch (err) {
      setError(err.message);
    }
  }

    

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", data.username);

      setToken(data.access_token);
      setUsername(data.username);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");

    setToken("");
    setUsername("");
    setHistory([]);
    setResult(null);
  }

  return (
   <>
      {!token ? (
  <main className="auth-page">
    <div className="auth-background-glow glow-one"></div>
    <div className="auth-background-glow glow-two"></div>

    <section className="auth-container">

      {/* LEFT BRANDING */}
      <div className="auth-brand">
        <div className="auth-logo">AI</div>

        <p className="auth-eyebrow">INTELLIGENT SALES ANALYTICS</p>

        <h1>
          Turn your sales data into
          <span> smarter decisions.</span>
        </h1>

        <p className="auth-description">
          AI-powered sales prediction and analytics platform
          designed to help you understand your business better.
        </p>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="feature-icon">↗</div>
            <div>
              <strong>Sales Prediction</strong>
              <span>Generate ML-based sales forecasts</span>
            </div>
          </div>

          <div className="auth-feature">
            <div className="feature-icon">◈</div>
            <div>
              <strong>Smart Analytics</strong>
              <span>Understand your prediction history</span>
            </div>
          </div>

          <div className="auth-feature">
            <div className="feature-icon">⚡</div>
            <div>
              <strong>Data Driven</strong>
              <span>Make better business decisions</span>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN / REGISTER CARD */}
      <div className="auth-card">

        <div className="auth-card-header">
          <div className="auth-card-icon">
            {showRegister ? "✦" : "→"}
          </div>

          <p className="auth-card-label">
            {showRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}
          </p>

          <h2>
            {showRegister ? "Create your account" : "Sign in to continue"}
          </h2>

          <p>
            {showRegister
              ? "Start exploring intelligent sales predictions."
              : "Access your personalized Sales Intelligence dashboard."}
          </p>
        </div>

        {!showRegister ? (
          <>
            <form onSubmit={handleLogin} className="auth-form">

              <label>
                Username
                <div className="auth-input-wrapper">
                  <span>◉</span>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </label>

              <label>
                Password
                <div className="auth-input-wrapper">
                  <span>●</span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <button className="auth-submit" type="submit">
                <span>Sign in</span>
                <span>→</span>
              </button>

            </form>

            <div className="auth-switch">
              <span>Don't have an account?</span>

              <button
                type="button"
                onClick={() => {
                  setShowRegister(true);
                  setError("");
                  setShowPassword(false);
                }}
              >
                Create one
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleRegister} className="auth-form">

              <label>
                Username
                <div className="auth-input-wrapper">
                  <span>◉</span>
                  <input
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </label>

              <label>
                Email
                <div className="auth-input-wrapper">
                  <span>@</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </label>

              <label>
                Password
                <div className="auth-input-wrapper">
                  <span>●</span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <button className="auth-submit" type="submit">
                <span>Create account</span>
                <span>→</span>
              </button>

            </form>

            <div className="auth-switch">
              <span>Already have an account?</span>

              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setError("");
                  setShowPassword(false);
                }}
              >
                Sign in
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="auth-footer">
          <span>AI Sales Intelligence</span>
          <span>•</span>
          <span>ML Powered</span>
        </div>

      </div>
    </section>
  </main>
) : (

  

            

        <main className="dashboard">
      <header className="topbar">
        <div className="brand-icon">AI</div>
        <div>
          <h1>Sales Intelligence</h1>
          <p>Machine Learning · Sales Prediction</p>
        </div>
        <span className="status"><span /> Dashboard</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">INTELLIGENT SALES ANALYTICS</p>
        <h2>Predict your next sales outcome.</h2>
        <p>
          Enter your business details to generate an ML-based sales prediction
          and review your recent prediction history.
        </p>
      </section>

      <section className="stats-grid">
  <div className="stat-card">
    <p>Total Predictions</p>
    <h2>{history.length}</h2>
    <span>Loaded prediction records</span>
  </div>

  <div className="stat-card">
    <p>Average Predicted Sales</p>
    <h2>
      ₹
      {history.length
        ? Math.round(
            history.reduce(
              (sum, item) => sum + Number(item.predicted_sales || 0),
              0
            ) / history.length
          ).toLocaleString("en-IN")
        : "0"}
    </h2>
    <span>Based on loaded history</span>
  </div>

  <div className="stat-card">
    <p>Total Predicted Sales</p>
    <h2>
      ₹
      {history
        .reduce(
          (sum, item) => sum + Number(item.predicted_sales || 0),
          0
        )
        .toLocaleString("en-IN", { maximumFractionDigits: 0 })}
    </h2>
    <span>Sum of loaded predictions</span>
  </div>
</section>


<section className="panel chart-panel">
  <div className="panel-heading">
    <div>
      <h3>Sales prediction overview</h3>
      <p>Predicted sales from your recent history</p>
    </div>
  </div>

  {history.length === 0 ? (
    <div className="empty-state">
      <p>No prediction data available yet.</p>
      <p>Generate a prediction to see your chart.</p>
    </div>
  ) : (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[...history].reverse()}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="id"
            tickFormatter={(value) => `#${value}`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
            width={90}
          />
          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              "Predicted Sales",
            ]}
            labelFormatter={(label) => `Prediction #${label}`}
          />
          <Bar
            dataKey="predicted_sales"
            fill="#7357e8"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}
</section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Sales prediction</h3>
              <p>Enter the details below</p>
            </div>
            <span className="panel-icon">↗</span>
          </div>

          <form onSubmit={predictSales}>
            <label>
              Product
              <select name="product" value={form.product} onChange={handleChange}>
                <option>Laptop</option>
                <option>Phone</option>
                <option>Tablet</option>
                <option>Monitor</option>
                <option>Headphones</option>
              </select>
            </label>

            <label>
              Region
              <select name="region" value={form.region} onChange={handleChange}>
                <option>North</option>
                <option>South</option>
                <option>East</option>
                <option>West</option>
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                name="quantity"
                min="1"
                max="100000"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Price per unit (₹)
              <input
                type="number"
                name="price"
                min="0.01"
                max="10000000"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Marketing spend (₹)
              <input
                type="number"
                name="marketing_spend"
                min="0"
                max="10000000"
                step="0.01"
                value={form.marketing_spend}
                onChange={handleChange}
                required
              />
            </label>

            <button className="predict-button" type="submit" disabled={loading}>
              {loading ? "Predicting..." : "Generate prediction →"}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {result && (
            <div className="result-card">
              <p>Predicted sales</p>
              <h2>
                ₹{Number(result.predicted_sales).toLocaleString("en-IN")}
              </h2>
              <span>{result.message}</span>
            </div>
          )}
        </div>


<div className="panel history-panel">
  <div className="panel-heading">
    <div>
      <h3>Prediction history</h3>
      <p>Recently saved predictions</p>
    </div>
    <button
      className="refresh-button"
      onClick={loadHistory}
      type="button"
    >
      Refresh
    </button>

<button
  className="refresh-button"
  type="button"
 onClick={exportToCSV}
>
  Export CSV
</button>

  </div>

  <div className="history-summary">
    <span>Recent records</span>
    <strong>{history.length} loaded</strong>
  </div>

  
<div className="history-controls">
  <input
    type="text"
    placeholder="Search product or region..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
  />

  <select
    value={regionFilter}
    onChange={(event) => setRegionFilter(event.target.value)}
  >
    <option value="All">All regions</option>
    <option value="North">North</option>
    <option value="South">South</option>
    <option value="East">East</option>
    <option value="West">West</option>
  </select>


<input
  type="date"
  aria-label="Start date"
  value={startDate}
  onChange={(event) => setStartDate(event.target.value)}
/>

<input
  type="date"
  aria-label="End date"
  value={endDate}
  min={startDate || undefined}
  onChange={(event) => setEndDate(event.target.value)}
/>

</div>

  {history.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">▤</div>
      <h4>No history loaded</h4>
      <p>Click Refresh to load saved predictions from your database.</p>
    </div>
  ) : (
    <div className="history-table-wrap">
      <table className="history-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Region</th>
            <th>Quantity</th>
            <th>Predicted Sales</th>
          </tr>
        </thead>
        <tbody>{filteredHistory.map((item) => (
          
            <tr key={item.id}>
              <td>{item.product}</td>
              <td>{item.region}</td>
              <td>{item.quantity}</td>
              <td>
                ₹{Number(item.predicted_sales).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}

{filteredHistory.length === 0 && history.length > 0 && (
  <tr>
    <td colSpan="4" style={{ textAlign: "center" }}>
      No matching predictions found.
    </td>
  </tr>
)}

        </tbody>
      </table>
    </div>
  )}


  <div className="pagination-controls">
    <button
      className="refresh-button"
      type="button"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((page) => page - 1)}
    >
      Previous
    </button>

    <span>
  Page {currentPage} of {Math.max(1, Math.ceil(totalRecords / 20))}
  {" "}({totalRecords} records)
</span>

    <button
      className="refresh-button"
      type="button"
      onClick={() => setCurrentPage((page) => page + 1)}
     disabled={currentPage * 20 >= totalRecords}
    >
      Next
    </button>
  </div>

</div>

      </section>

      <footer>
        AI Sales Intelligence <span>•</span> Predictions depend on the trained
        model and the data it learned from.
      </footer>
           </main>
)}
      
    </>
  );
}

export default App;