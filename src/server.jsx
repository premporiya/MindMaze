require("dotenv").config();
const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

async function runQuery(query, binds = []) {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING,
        });

        const result = await connection.execute(query, binds, { autoCommit: true });
        return result;
    } catch (err) {
        console.error(err);
        return null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

app.post("/save-score", async (req, res) => {
    const { firstName, lastName, email, score } = req.body;
    const query = `INSERT INTO quiz_scores (first_name, last_name, email, score) VALUES (:1, :2, :3, :4)`;
    const result = await runQuery(query, [firstName, lastName, email, score]);
    res.json({ success: result ? true : false });
});

app.listen(5000, () => console.log("Server running on port 5000"));
