import React from 'react';
import SearchBar from './SearchBar';
import Navbar from './Navbar';
import './App.css';
// import axios from 'axios';

const App = () => {

    return (
        <div>
            <Navbar />
            <div class="title">
            <h1>Social Sentiment Analyzer</h1>
            <h1>Exploring Public Opinions on Key Social Issues</h1>
            </div>
            <div className="search-container">
                <SearchBar/>
            </div>
        </div>
    );
};

export default App;

