import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = ({ filter, startDate, endDate }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use environment variable for API base URL
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        let url = `${baseUrl}/api/sales_by_type?filter=${filter}`;
        
        if (filter === 'custom') {
          if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
          }
          url += `&start_date=${startDate}&end_date=${endDate}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          setChartData({ labels: [], datasets: [] });
          return;
        }

        if (data.length === 0) {
          setError('No data available for selected period');
          setChartData({ labels: [], datasets: [] });
          return;
        }

        const labels = data.map(item => item.fuel_type);
        const quantities = data.map(item => item.total_quantity);
        
        setChartData({
          labels,
          datasets: [{
            label: 'Total Quantity Sold',
            data: quantities,
            backgroundColor: 'rgba(32, 0, 150, 0.53)',
          }],
        });
        setError(null);

      } catch (err) {
        setError(err.message || 'Failed to fetch sales data');
        setChartData({ labels: [], datasets: [] });
      }
    };

    fetchData();
  }, [filter, startDate, endDate]);

  return (
    <div>
      <h2>Sales by Fuel Type</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : chartData.labels.length > 0 ? (
        <Bar data={chartData} />
      ) : (
        !error && <p>No data available for this period.</p>
      )}
    </div>
  );
};

export default SalesChart;
