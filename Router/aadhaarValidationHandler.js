module.exports = function (client) {
    const express = require('express');
    const otpGenerator = require('otp-generator');
    require('dotenv').config();
    const twilioClient = require('twilio')(process.env.Twilio_Account_SID, process.env.Twilio_Auth_Token);
    const aadhaarValidationHandler = express.Router();
    const moment = require('moment');
    const dbName = 'Task1';
    aadhaarValidationHandler.post("/", async (req, res) => {

        if (!req.body) {
            res.sendStatus(400);
            return;
        }
        const userAadhaarNumber = req.body.aadhaarNumber;
        if (!userAadhaarNumber) {

            res.sendStatus(400);
            return;
        }
        const db = client.db(dbName);
        const collection = db.collection('aadhaar');
        try {

            let result = await collection.findOne({ aadhaarNumber: userAadhaarNumber });
            if (result) {
                //send sms to registered number
                const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
                await twilioClient.messages
                    .create({
                        body: `Your OTP to verify Aadhaar is  ${OTP}`,
                        from: process.env.Twilio_phoneNum,
                        to: result.phoneNumber
                    })
                const otpCollection = db.collection('otpdetail');
                let expiryDate = moment(Date.now()).add(5, 'm').toDate();
                let newOTPdocument = await otpCollection.insertOne({ aadhaarNumber: userAadhaarNumber, otp: OTP, expiry: expiryDate });
                res.cookie("aadhaar", userAadhaarNumber);
                res.send({ "status": "SUCCESS", "message": "OTP sent successfully", "ref_id": newOTPdocument.insertedId })
            } else
                res.send({
                    "ref_id": "208",
                    "status": "INVALID",
                    "message": "Invalid Aadhaar Card"
                });
        } catch (error) {
            res.sendStatus(500);
        }
    })






    return aadhaarValidationHandler;
}