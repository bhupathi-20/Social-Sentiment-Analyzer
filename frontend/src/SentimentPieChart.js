// SentimentPieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentPieChart = ({ sentimentData }) => {
  // Prepare data for the pie chart
  const pieData = {
    labels: Object.keys(sentimentData),
    datasets: [
      {
        data: Object.values(sentimentData),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Colors for Negative, Neutral, Positive
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <div className="pie-chart-container">
      <h3>Sentiment Distribution</h3>
      <Pie data={pieData} />
    </div>
  );
};

export default SentimentPieChart;
