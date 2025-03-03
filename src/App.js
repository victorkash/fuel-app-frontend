import SalesOverTimeChart from './SalesOverTimeChart';
import SalesChart from './SalesChart';
import React, { useState } from 'react';
import './App.css';

function App() {
  const API_URL = 'https://fuel-app-backend-1.onrender.com';
  const [sale, setSale] = useState({ fuel_type: '', quantity: '', price: '', date: '' });
  const [filter, setFilter] = useState('alltime');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState({ name: '', points: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sale.fuel_type) {
      alert("Please select a fuel type.");
      return;
    }
    try {
      console.log('Data being sent:', sale);
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
      setSale({ fuel_type: '', quantity: '', price: '', date: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const addCustomer = async () => {
    if (!customer.name) {
      alert('Please provide a customer name.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customer.name }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add customer');
      }
      alert('Customer added successfully!');
      setCustomer({ name: '', points: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const rewardCustomer = async () => {
    if (!customer.name || !customer.points) {
      alert('Please provide both customer name and points.');
      return;
    }
    console.log('Sending reward request with:', customer);
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
      setCustomer({ name: '', points: '' });
    } catch (error) {
      alert(error.message);
    }
  };

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

        <section>
          <h2>Reports & Analytics</h2>
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
          <div>
            <SalesChart filter={filter} startDate={startDate} endDate={endDate} />
          </div>
          <div>
            <SalesOverTimeChart filter={filter} startDate={startDate} endDate={endDate} />
          </div>
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

        <section>
          <h2>Loyalty Programs</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Customer Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <button type="button" onClick={addCustomer}>Add Customer</button>
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
