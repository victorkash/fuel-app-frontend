import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesOverTimeChart = ({ filter, startDate, endDate }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use environment variable
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        let url = `${baseUrl}/api/sales_over_time?filter=${filter}`;

        // Validate dates for custom filter
        if (filter === 'custom') {
          if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
          }
          url += `&start_date=${startDate}&end_date=${endDate}`;
        }

        const response = await fetch(url);
        
        // Check for HTTP errors
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Handle backend errors
        if (data.error) {
          setError(data.error);
          setChartData({ labels: [], datasets: [] });
          return;
        }

        // Handle empty data
        if (data.length === 0) {
          setError('No sales data available for selected period');
          setChartData({ labels: [], datasets: [] });
          return;
        }

        // Transform data for chart
        const labels = data.map(item => item.date);
        const salesData = data.map(item => item.total_sales);

        setChartData({
          labels,
          datasets: [{
            label: 'Total Sales ($)',
            data: salesData,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          }],
        });
        setError(null);

      } catch (err) {
        setError(err.message || 'Failed to load sales data');
        setChartData({ labels: [], datasets: [] });
      }
    };

    fetchData();
  }, [filter, startDate, endDate]);

  return (
    <div>
      <h2>Sales Over Time</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : chartData.labels.length > 0 ? (
        <Line data={chartData} />
      ) : (
        !error && <p>Select a period to view sales data</p>
      )}
    </div>
  );
};

export default SalesOverTimeChart;

export default SalesOverTimeChart;
