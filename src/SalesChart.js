import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = ({ filter, startDate, endDate }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use environment variable for API URL
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        let url = `${baseUrl}/api/sales_by_type?filter=${filter}`;

        // Date validation
        if (filter === 'custom') {
          if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            setIsLoading(false);
            return;
          }

          const today = new Date().toISOString().split('T')[0];
          if (startDate > today || endDate > today) {
            setError('Future dates are not allowed');
            setIsLoading(false);
            return;
          }

          url += `&start_date=${startDate}&end_date=${endDate}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (!data || data.length === 0) {
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

      } catch (err) {
        setError(err.message.includes('Failed to fetch') 
          ? 'Failed to connect to the server' 
          : err.message
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filter, startDate, endDate]);

  return (
    <div>
      <h2>Sales by Fuel Type</h2>
      {isLoading ? (
        <p>Loading data...</p>
      ) : error ? (
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
