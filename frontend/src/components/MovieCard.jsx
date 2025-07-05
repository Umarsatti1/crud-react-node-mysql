"use client"

import React from "react"
import MovieDialog from "./MovieDialog"
import axios from "axios"

const MovieCard = (props) => {
  const [open, setOpen] = React.useState(false)
  const cardOpen = () => setOpen(true)

  const handleDeleteMovie = () => {
    axios
      .delete(`${props.baseUrl}/delete/${props.id}`)
      .then(() => {
        props.refreshMovies()
      })
      .catch((error) => {
        console.error("Error deleting movie:", error)
        alert("Error deleting movie. Please try again.")
      })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <>
      <MovieDialog
        open={open}
        setOpen={setOpen}
        id={props.id}
        name={props.name}
        release_date={props.release_date}
        genre={props.genre}
        rating={props.rating}
        baseUrl={props.baseUrl}
        refreshMovies={props.refreshMovies}
      />
      <div className="movie-card" onClick={cardOpen}>
        <div className="info">
          <h4>{props.name}</h4>
          <p>Release Date: {formatDate(props.release_date)}</p>
          <p>Genre: {props.genre}</p>
          <p>Rating: {props.rating !== null ? props.rating.toFixed(1) : "N/A"} / 10</p>
        </div>
        <div className="actions">
          <button
            className="delete"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteMovie()
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

export default MovieCard
