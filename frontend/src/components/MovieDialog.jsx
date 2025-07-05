"use client"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import { useState, useEffect } from "react"
import axios from "axios"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import DatePicker from "./DatePicker"

const darkTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1B3C53",
    },
    secondary: {
      main: "#456882",
    },
    background: {
      default: "#F9F3EF",
      paper: "#F9F3EF",
    },
    text: {
      primary: "#1B3C53",
      secondary: "#456882",
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#F9F3EF",
          border: "1px solid #D2C1B6",
          borderRadius: "16px",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#1B3C53",
          fontWeight: 700,
        },
      },
    },
  },
})

export default function MovieDialog(props) {
  const [editValues, setEditValues] = useState({
    id: props.id,
    name: props.name,
    release_date: props.release_date,
    genre: props.genre,
    rating: props.rating,
  })

  useEffect(() => {
    setEditValues({
      id: props.id,
      name: props.name,
      release_date: props.release_date ? new Date(props.release_date).toISOString().split("T")[0] : "",
      genre: props.genre,
      rating: props.rating,
    })
  }, [props.id, props.name, props.release_date, props.genre, props.rating])

  const handleEditValues = () => {
    axios
      .put(`${props.baseUrl}/edit`, {
        id: editValues.id,
        name: editValues.name,
        release_date: editValues.release_date,
        genre: editValues.genre,
        rating: Number.parseFloat(editValues.rating),
      })
      .then(() => {
        props.setOpen(false)
        props.refreshMovies()
      })
      .catch((err) => {
        console.error("Failed to update movie:", err)
      })
  }

  const handleChangeValues = (value) => {
    setEditValues((prevValues) => ({
      ...prevValues,
      [value.target.id || value.target.name]: value.target.value,
    }))
  }

  const handleClose = () => {
    props.setOpen(false)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog open={props.open} onClose={handleClose}>
        <DialogTitle>Edit Movie</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Movie Title"
            defaultValue={editValues.name}
            type="text"
            onChange={handleChangeValues}
            fullWidth
            variant="standard"
          />
          <div style={{ marginTop: "16px", marginBottom: "8px" }}>
            <label
              style={{
                fontSize: "0.75rem",
                color: "#456882",
                fontWeight: 500,
                display: "block",
                marginBottom: "8px",
              }}
            >
              Release Date
            </label>
            <DatePicker
              value={editValues.release_date}
              onChange={handleChangeValues}
              name="release_date"
              id="release_date"
              placeholder="Select release date"
            />
          </div>
          <TextField
            margin="dense"
            id="genre"
            label="Genre"
            defaultValue={editValues.genre}
            type="text"
            onChange={handleChangeValues}
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            id="rating"
            label="Rating (0-10)"
            defaultValue={editValues.rating}
            type="number"
            inputProps={{ min: "0", max: "10", step: "0.1" }}
            onChange={handleChangeValues}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleEditValues}>Save</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}
