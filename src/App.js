
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [apodData, setApodData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light"); 

  const fetchAPODs = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/nasa/apods`, {
        params: { search: searchTerm, sort: sortOrder },
      });
      setApodData(response.data);
      setError(""); // Clearing  any previous errors , if exists 
    } catch (error) {
      console.error("Error fetching data from the server", error);
      setError("Failed to fetch data from the server. ");
    }
  }, [searchTerm, sortOrder]);

  useEffect(() => {
    fetchAPODs();
  }, [fetchAPODs]);

  const fetchAPOD = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5000/api/nasa/apod`, {
        params: { date: date },
      });
      fetchAPODs(); // Refreshing the  data after fetching
      setError(""); // Clearing previous errors , if eexists 
    } catch (error) {
      console.error("Error fetching data from NASA API", error);
      setError("Failed to fetch data from NASA API.");
    }
  };

  const handleDateChange = (e) => setDate(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSort = (order) => setSortOrder(order);

  // Toggle theme between light and dark mode
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className={`App ${theme}`}>
      <h1>NASA Astronomy Picture of the Day</h1>
      {/* button for toggle between light and dark mode  */}
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
      <form onSubmit={fetchAPOD}>
        <input type="date" value={date} onChange={handleDateChange} />
        <button type="submit">Fetch Picture</button>
      </form>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={() => handleSort("asc")}>Sort by Date (Asc)</button>
        <button onClick={() => handleSort("desc")}>Sort by Date (Desc)</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Displaying the  data in  grid */}
      <div className="apod-grid">
        {apodData.length > 0 ? (
          apodData.map((data, index) => (
            <div key={index} className="apod-container">
              <h2>{data.title}</h2>
              {data.url.includes("youtube") ? (
                <iframe
                  width="100%"
                  height="200"
                  src={data.url}
                  title={data.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : (
                <img src={data.url} alt={data.title} />
              )}
              {/* for displaying the particular date of that image  */}
              <p className="image-date">{data.date}</p>
              <p>{data.explanation}</p>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
}

export default App;
