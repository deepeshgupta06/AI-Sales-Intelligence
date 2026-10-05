
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
  loadHistory(currentPage);
}, [currentPage]);


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
      const response = await fetch(
        `https://ai-sales-intelligence-qip6.onrender.com/predict?${params.toString()}`,
        { method: "POST" }
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
      `https://ai-sales-intelligence-qip6.onrender.com/history?page=${page}&page_size=20`
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

  return (
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
  );
}

export default App;