const express = require('express');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.json());
require('dotenv').config();
const client = new MongoClient(process.env.Database_url);
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("connected to database");
    } catch (err) {
        console.log(err);
    }
}
connectToDatabase();

const aadhaarValidationHandler = require('./Router/aadhaarValidationHandler')(client);
const otpVerifyHandler = require('./Router/otpVerifyHandler')(client);
app.use('/verification/aadhaar/otp', aadhaarValidationHandler);
app.use('/verification/aadhaar/verify', otpVerifyHandler);
app.listen(4000, () => console.log("server is running on 4000 port"));
