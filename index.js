const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('./swagger.js');
require('dotenv').config();
const cors = require('cors');
const mongoString = process.env.DATABASE_URL;
const app = express();
app.use(swaggerUi);
app.use(cors());
mongoose.connect(mongoString);
const database = mongoose.connection;
const routes = require('./routes/routes');
database.on('error', (error) => {});
database.once('connected', () => {});

app.use(express.json({ limit: '4mb' }));
app.use('/api', routes);
app.use(express.json());
app.listen(3001, () => {
    console.log(`Server Started at ${3001} ` + mongoString);
});
module.exports = app;
