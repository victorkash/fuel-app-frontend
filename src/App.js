import SalesOverTimeChart from './SalesOverTimeChart';
import SalesChart from './SalesChart';
import React, { useState } from 'react';
import './App.css';

function App() {
  const API_URL = 'https://fuel-app-backend.onrender.com';
  const [sale, setSale] = useState({ fuel_type: '', quantity: '', price: '', date: '' });
  const [filter, setFilter] = useState('alltime'); // Default to "All Time"
  const [startDate, setStartDate] = useState(''); // Start date for custom range
  const [endDate, setEndDate] = useState(''); // End date for custom range
  const [reportData, setReportData] = useState([]); // Data for the report table
  const [loading, setLoading] = useState(false); // Loading state for report generation
  const [error, setError] = useState(null); // Error messages
  const [customer, setCustomer] = useState({ name: '', points: '' });

  // Handle sale submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log sale');
      }
      console.log('Sale logged successfully');
      setSale({ fuel_type: '', quantity: '', price: '', date: '' }); // Reset form
    } catch (error) {
      alert(error.message);
    }
  };

  // Add a customer
  const addCustomer = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customer.name }),
      });
      if (!response.ok) throw new Error('Failed to add customer');
      console.log('Customer added successfully');
      setCustomer({ name: '', points: '' }); // Reset form
    } catch (error) {
      alert(error.message);
    }
  };

  // Reward points to a customer
  const rewardCustomer = async () => {
    if (!customer.name || !customer.points) {
      alert('Please provide both customer name and points.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reward points');
      }
      alert('Points rewarded successfully!');
      setCustomer({ name: '', points: '' }); // Reset form
    } catch (error) {
      alert(error.message);
    }
  };

  // Generate report based on filter and date range
  const generateReport = async () => {
    setLoading(true);
    setError(null);
    let url = `${API_URL}/api/reports?filter=${filter}`;
    if (filter === 'custom') {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        setLoading(false);
        return;
      }
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setReportData([]);
      } else {
        setReportData(data);
      }
    } catch (err) {
      setError(err.message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Ammica Fuel Management Dashboard</h1>
      </header>
      <main>
        {/* Sales Tracking Section */}
        <section>
          <h2>Sales Tracking</h2>
          <form onSubmit={handleSubmit}>
            <select
              value={sale.fuel_type}
              onChange={(e) => setSale({ ...sale, fuel_type: e.target.value })}
            >
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Kerosine">Kerosine</option>
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={sale.quantity}
              onChange={(e) => setSale({ ...sale, quantity: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={sale.price}
              onChange={(e) => setSale({ ...sale, price: e.target.value })}
            />
            <input
              type="date"
              value={sale.date}
              onChange={(e) => setSale({ ...sale, date: e.target.value })}
            />
            <button type="submit" disabled={!sale.fuel_type}>
              Log Sale
            </button>
          </form>
        </section>

        {/* Reports & Analytics Section */}
        <section>
          <h2>Reports & Analytics</h2>
          {/* Filter Controls */}
          <div>
            <h3>Filter Options</h3>
            <button onClick={() => setFilter('alltime')}>All Time</button>
            <button onClick={() => setFilter('custom')}>Custom Date Range</button>
            {filter === 'custom' && (
              <div className="date-inputs">
                <label>Start Date: </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <label>End Date: </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Sales by Fuel Type Chart */}
          <div>
            <SalesChart filter={filter} startDate={startDate} endDate={endDate} />
          </div>

          {/* Sales Over Time Chart */}
          <div>
            <SalesOverTimeChart filter={filter} startDate={startDate} endDate={endDate} />
          </div>

          {/* Generate Report Button and Table */}
          <div>
            <button onClick={generateReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {reportData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Fuel Type</th>
                    <th>Total Quantity</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.fuel_type}</td>
                      <td>{item.total_quantity}</td>
                      <td>₦{item.total_revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !loading && <p>No report data yet. Click "Generate Report" to fetch.</p>
            )}
          </div>
        </section>

        {/* Loyalty Programs Section */}
        <section>
          <h2>Loyalty Programs</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Customer Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Points"
              value={customer.points}
              onChange={(e) => setCustomer({ ...customer, points: e.target.value })}
            />
            <button type="button" onClick={rewardCustomer}>Reward Points</button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
