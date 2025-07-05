const express = require('express');
const server = express();
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

server.use(express.json());
server.use(cors());

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Sirsatti123!",
};

const DATABASE_NAME = process.env.DB_DATABASE || "movies_db";
const TABLE_NAME = "movies";

const initialConnection = mysql.createConnection(dbConfig);

initialConnection.connect(err => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL for initial database check.");

    initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`, (err) => {
        if (err) {
            console.error("Error creating database:", err);
            initialConnection.end();
            return;
        }
        console.log(`Database '${DATABASE_NAME}' ready.`);

        initialConnection.end();

        const db = mysql.createPool({
            ...dbConfig,
            database: DATABASE_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        db.getConnection((err, connection) => {
            if (err) {
                console.error("Error getting connection from pool:", err);
                process.exit(1);
            }
            console.log("Successfully connected to the database pool.");
            connection.release();
        });

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                idmovies INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                release_date DATE,
                genre VARCHAR(255),
                rating FLOAT
            )
        `;
        db.query(createTableQuery, (err) => {
            if (err) {
                console.error("Error creating table:", err);
            } else {
                console.log(`Table '${TABLE_NAME}' ready.`);
            }
        });

        server.post("/register", (req, res) => {
            const { name, release_date, genre, rating } = req.body;
            const sql = `INSERT INTO ${TABLE_NAME} (name, release_date, genre, rating) VALUES (?, ?, ?, ?)`;
            db.query(sql, [name, release_date, genre, rating], (err, result) => {
                if (err) {
                    console.error("Error inserting movie:", err);
                    res.status(500).send("Error inserting movie");
                } else {
                    res.status(201).json({ message: "Movie added successfully", id: result.insertId });
                }
            });
        });

        server.get("/movies", (req, res) => {
            const sql = `SELECT * FROM ${TABLE_NAME}`;
            db.query(sql, (err, result) => {
                if (err) {
                    console.error("Error fetching movies:", err);
                    res.status(500).send("Error fetching movies");
                } else {
                    res.status(200).json(result);
                }
            });
        });

        server.put("/edit", (req, res) => {
            const { id, name, release_date, genre, rating } = req.body;
            const sql = `UPDATE ${TABLE_NAME} SET name = ?, release_date = ?, genre = ?, rating = ? WHERE idmovies = ?`;
            db.query(sql, [name, release_date, genre, rating, id], (err, result) => {
                if (err) {
                    console.error("Error updating movie:", err);
                    res.status(500).send("Error updating movie");
                } else {
                    if (result.affectedRows === 0) {
                        res.status(404).send("Movie not found");
                    } else {
                        res.status(200).send("Movie updated successfully");
                    }
                }
            });
        });

        server.delete("/delete/:id", (req, res) => {
            const { id } = req.params;
            const sql = `DELETE FROM ${TABLE_NAME} WHERE idmovies = ?`;
            db.query(sql, [id], (err, result) => {
                if (err) {
                    console.error("Error deleting movie:", err);
                    res.status(500).send("Error deleting movie");
                } else {
                    if (result.affectedRows === 0) {
                        res.status(404).send("Movie not found");
                    } else {
                        res.status(200).send("Movie deleted successfully");
                    }
                }
            });
        });

        server.get('/health', (req, res) => {
            res.status(200).send('Backend is healthy');
        });

        const PORT = process.env.PORT || 3001;
        server.listen(PORT, () =>
            console.log(`Running on port ${PORT}`)
        );
    });
});