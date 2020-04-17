const express = require ('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 5000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true});
const connection = mongoose.connection;
connection.once('open', function(){
    console.log("DB connection established successfully");
})

app.use(cors());
app.use(express.json({limit: '50mb'}));

var sign_s3 = require('./sign_s3');
app.use('/sign_s3', sign_s3.sign_s3);
app.listen(PORT, function(){
    console.log("Server is running on Port: " +PORT);
})