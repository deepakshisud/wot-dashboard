const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');

app.get('/home', (req, res) => {
    res.send("working");
})

app.listen(3000, () => {
    console.log("connected on port 3000");
})