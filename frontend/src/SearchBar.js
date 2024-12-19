import React, { useState } from 'react';
import './App.css'; // Import the CSS file
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caption: query }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.sentiment_percentages); // Set the sentiment percentages
        setSentimentData(data.top_captions); // Set the top captions
      } else {
        setResult("Error in retrieving sentiment analysis. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setResult("Error in retrieving sentiment analysis. Please try again.");
    }
  };

  // Prepare data for the pie chart if results are available
  const pieData = result
    ? {
        labels: Object.keys(result),
        datasets: [
          {
            data: Object.values(result),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Colors for Negative, Neutral, Positive
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          },
        ],
      }
    : null;

  return (
    <div>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Enter a topic..."
        />
        <button type="submit">Search</button>
      </form>

      {result && sentimentData && (
        <div className="result-container">
          {/* Sentiment Percentages */}
          <div className="card">
            <h3>Sentiment Analysis Result:</h3>
            <ul>
              {Object.entries(result).map(([sentiment, percentage], index) => (
                <li key={index}>
                  {sentiment}: {percentage}%
                </li>
              ))}
            </ul>
          </div>

          {/* Display the Pie Chart */}
          <div className="pie-chart-container">
            <h3>Sentiment Distribution</h3>
            <Pie data={pieData} />
          </div>

          {/* Display Captions grouped by Sentiment */}
          <div className="captions-group">
            {Object.entries(sentimentData).map(([sentiment, captions]) => (
              <div key={sentiment} className={`${sentiment.toLowerCase()}-captions`}>
                <h3>{sentiment}</h3>
                <ul>
                  {captions.map((caption, index) => (
                    <li key={index}>{caption}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
