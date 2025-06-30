const express = require('express');
const server = express();
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

server.use(express.json());
server.use(cors());

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Sirsatti123!",
};

// Step 1: Connect without specifying the database
const initialConnection = mysql.createConnection(dbConfig);

initialConnection.query("CREATE DATABASE IF NOT EXISTS crudgames", (err) => {
    if (err) {
        console.error("Error creating database:", err);
        return;
    }
    console.log("Database 'crudgames' ready.");

    // Step 2: Now connect using the created database
    const db = mysql.createPool({
        ...dbConfig,
        database: process.env.DB_DATABASE || "crudgames",
    });

    // Step 3: Create the 'games' table if not exists
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS games (
            idgames INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            cost FLOAT,
            category VARCHAR(255)
        )
    `;
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating table:", err);
        } else {
            console.log("Table 'games' ready.");
        }
    });

    // All your API routes here:
    server.post("/register", (req, res) => {
        const { name, cost, category } = req.body;
        const sql = "INSERT INTO games (name, cost, category) VALUES (?, ?, ?)";
        db.query(sql, [name, cost, category], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error inserting game");
            } else {
                res.send(result);
            }
        });
    });

    server.get("/games", (req, res) => {
        const sql = "SELECT * FROM games";
        db.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error fetching games");
            } else {
                res.send(result);
            }
        });
    });

    server.put("/edit", (req, res) => {
        const { id, name, cost, category } = req.body;
        const sql = "UPDATE games SET name = ?, cost = ?, category = ? WHERE idgames = ?";
        db.query(sql, [name, cost, category, id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error updating game");
            } else {
                res.send(result);
            }
        });
    });

    server.delete("/delete/:index", (req, res) => {
        const { index } = req.params;
        const sql = "DELETE FROM games WHERE idgames = ?";
        db.query(sql, [index], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error deleting game");
            } else {
                res.send(result);
            }
        });
    });

    server.get('/health', (req, res) => {
        res.status(200).send('Backend is healthy');
    });

    server.listen(3001, () =>
        console.log("Running on port 3001")
    );
});