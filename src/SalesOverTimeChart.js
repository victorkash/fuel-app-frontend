import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesOverTimeChart = ({ filter, startDate, endDate }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let url = `http://127.0.0.1:5000/api/sales_over_time?filter=${filter}`;
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
          const labels = data.map(item => item.date);
          const sales = data.map(item => item.total_sales);
          setChartData({
            labels,
            datasets: [{
              label: 'Total Sales Over Time',
              data: sales,
              fill: false,
              borderColor: 'rgb(174, 0, 255)',
              tension: 0.1,
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
      <h2>Sales Over Time</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : chartData.labels.length > 0 ? (
        <Line data={chartData} />
      ) : (
        <p>No data available for this period.</p>
      )}
    </div>
  );
};

export default SalesOverTimeChart;