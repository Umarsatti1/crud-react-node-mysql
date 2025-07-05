// App.jsx (frontend)

import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import MovieCard from './components/MovieCard';
import DatePicker from "./components/DatePicker"

function App() {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const [values, setValues] = useState({
    name: "",
    release_date: "",
    genre: "",
    rating: "",
  })
  const [movies, setMovies] = useState([])

  const handleChangeValues = (e) => {
    setValues((prevValue) => ({
      ...prevValue,
      [e.target.name]: e.target.value,
    }))
  }

  const refreshMovies = () => {
    Axios.get(`${baseUrl}/movies`)
      .then((response) => {
        setMovies(response.data)
      })
      .catch((error) => {
        console.error("Error fetching movies:", error)
      })
  }

  const handleClickButton = () => {
    if (!values.name || !values.release_date || !values.genre || !values.rating) {
      alert("Please fill in all fields.")
      return
    }
    Axios.post(`${baseUrl}/register`, {
      name: values.name,
      release_date: values.release_date,
      genre: values.genre,
      rating: Number.parseFloat(values.rating),
    })
      .then(() => {
        refreshMovies()
        setValues({
          name: "",
          release_date: "",
          genre: "",
          rating: "",
        })
      })
      .catch((error) => {
        console.error("Error adding movie:", error)
        alert("Error adding movie. Please try again.")
      })
  }

  useEffect(() => {
    refreshMovies()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">🎬 Movie Collection</h1>
        <h3>Add a New Movie</h3>
        <div className="register-box">
          <div className="input-group">
            <label htmlFor="name">Movie Title</label>
            <input
              className="register-input"
              type="text"
              id="name"
              name="name"
              placeholder="Enter movie title"
              value={values.name}
              onChange={handleChangeValues}
            />
          </div>
          <div className="input-group">
            <label htmlFor="release_date">Release Date</label>
            <DatePicker
              value={values.release_date}
              onChange={handleChangeValues}
              name="release_date"
              id="release_date"
              placeholder="Select release date"
            />
          </div>
          <div className="input-group">
            <label htmlFor="genre">Genre</label>
            <input
              className="register-input"
              type="text"
              id="genre"
              name="genre"
              placeholder="e.g., Action, Comedy, Drama"
              value={values.genre}
              onChange={handleChangeValues}
            />
          </div>
          <div className="input-group">
            <label htmlFor="rating">Rating</label>
            <input
              className="register-input"
              type="number"
              id="rating"
              name="rating"
              placeholder="0.0 - 10.0"
              value={values.rating}
              min="0"
              max="10"
              step="0.1"
              onChange={handleChangeValues}
            />
          </div>
          <button className="register-button" onClick={handleClickButton}>
            ✨ Add Movie
          </button>
        </div>
        <br />
        <div className="cards">
          {Array.isArray(movies) &&
            movies.map((movie) => (
              <MovieCard
                key={movie.idmovies}
                id={movie.idmovies}
                name={movie.name}
                release_date={movie.release_date}
                genre={movie.genre}
                rating={movie.rating}
                baseUrl={baseUrl}
                refreshMovies={refreshMovies}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default App