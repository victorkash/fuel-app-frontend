import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = ({ filter, startDate, endDate }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let url = `http://127.0.0.1:5000/api/sales_by_type?filter=${filter}`;
      if (filter === 'custom' && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
          setError(data.error);
          setChartData({ labels: [], datasets: [] });
        } else {
          setError(null);
          const labels = data.map(item => item.fuel_type); // Fuel types
          const quantities = data.map(item => item.total_quantity); // Quantities
          setChartData({
            labels,
            datasets: [{
              label: 'Total Quantity Sold',
              data: quantities,
              backgroundColor: 'rgba(32, 0, 150, 0.53)',
            }],
          });
        }
      } catch (err) {
        setError('Failed to fetch sales data');
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
        <p>No data available for this period.</p>
      )}
    </div>
  );
};

export default SalesChart;