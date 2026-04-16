import 'dotenv/config';
import nodemailer from 'nodemailer';
import fs from 'fs';

const logFile = 'otp_debug.log';
const log = (msg) => {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(logFile, entry);
};

if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

log('Starting OTP Debug for CNGUserPage...');
log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '********' : 'MISSING'}`);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

log('Verifying transporter...');
transporter.verify((error, success) => {
    if (error) {
        log(`Verification FAILED: ${error.message}`);
        process.exit(1);
    } else {
        log('Verification SUCCESS: Transporter is ready');
        log('Sending test email...');
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'CNGUserPage OTP Debug Test',
            text: 'This is a test email from the cnguserpage OTP debug script.',
        };

        transporter.sendMail(mailOptions, (sendErr, info) => {
            if (sendErr) {
                log(`Send FAILED: ${sendErr.message}`);
                process.exit(1);
            } else {
                log(`Send SUCCESS: ${info.response}`);
                process.exit(0);
            }
        });
    }
});
