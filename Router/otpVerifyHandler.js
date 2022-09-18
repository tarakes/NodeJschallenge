module.exports = function (client) {
    const express = require("express");
    const otpVerifyHandler = express.Router();
    const dbName = "Task1";
    otpVerifyHandler.post("/", async (req, res) => {
        const userAadhaarNumber = req.cookies.aadhaar;
        const userOtp = req.body.otp;
        if (!userAadhaarNumber || !userOtp) {
            res.sendStatus(400);
            return;
        }
        const db = client.db(dbName);
        const otpCollection = db.collection("otpdetail");
        try {
            let otpResult = await otpCollection.findOne({
                aadhaarNumber: userAadhaarNumber
            });
            if (otpResult && otpResult.otp === userOtp && Date.now() <= otpResult.expiry) {
                const aadhaarCollection = db.collection("aadhaardetail");
                let aadhaarResult = await aadhaarCollection.findOne({
                    aadhaarNumber: userAadhaarNumber
                });
                await otpCollection.deleteOne({ aadhaarNumber: userAadhaarNumber });
                res.send({
                    status: "VALID",
                    message: "Aadhaar Card Exits",
                    ...aadhaarResult
                });

            } else res.send({
                status: "INVALID",
                message: "Wrong OTP"
            });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    });
    return otpVerifyHandler;
};
