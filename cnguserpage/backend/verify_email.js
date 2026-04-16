import 'dotenv/config';
import nodemailer from 'nodemailer';
import fs from 'fs';

const log = [];
log.push(`EMAIL_USER: ${process.env.EMAIL_USER}`);
log.push(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'FOUND' : 'MISSING'}`);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        log.push(`Verification Error: ${error.message}`);
        fs.writeFileSync('verify_result.txt', log.join('\n'));
        process.exit(1);
    } else {
        log.push('Verification Success: Transporter is ready');
        fs.writeFileSync('verify_result.txt', log.join('\n'));
        process.exit(0);
    }
});
