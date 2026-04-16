import 'dotenv/config';
import nodemailer from 'nodemailer';

// Configure this with your real SMTP details in .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: `"CNG Gas Station" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    const isPlaceholder = !process.env.EMAIL_USER ||
        process.env.EMAIL_USER === 'your-email@gmail.com' ||
        !process.env.EMAIL_PASS ||
        process.env.EMAIL_PASS === 'your-16-char-app-password';

    if (!isPlaceholder) {
        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    } else {
        console.warn('EMAIL_USER or EMAIL_PASS not set correctly. Logging to console.');
        console.log(`[EMAIL FALLBACK] To: ${to} | Subject: ${subject}`);
        return true;
    }
};

export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"CNG Gas Station" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your CNG Gas Station Verification Code',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #040f16; color: #cbd5e1; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background-color: #0a1924; border: 2px solid #14b8a6; border-radius: 12px; line-height: 60px; font-size: 30px;">⛽</div>
                    <h1 style="color: #14b8a6; margin-top: 15px; font-size: 24px; letter-spacing: -0.5px;">CNG Bunk Finder</h1>
                </div>
                
                <div style="background-color: #0a1924; padding: 30px; border-radius: 12px; border: 1px solid #1e293b; text-align: center;">
                    <h2 style="color: #ffffff; margin-bottom: 10px; font-size: 20px;">Verify Your Email</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #94a3b8; margin-bottom: 25px;">
                        Use the code below to complete your registration for <br/>
                        <strong style="color: #14b8a6;">${email}</strong>
                    </p>
                    
                    <div style="background-color: #040f16; padding: 20px; border-radius: 8px; border: 1px dashed #14b8a6; display: inline-block; margin-bottom: 25px;">
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: monospace;">${otp}</span>
                    </div>
                    
                    <p style="font-size: 13px; color: #64748b;">
                        This code is valid for <strong>10 minutes</strong>. <br/>
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #475569; font-size: 12px;">
                    <p>&copy; 2026 CNG Bunk Finder. All rights reserved.</p>
                </div>
            </div>
        `,
    };

    return sendEmail({ 
        to: email, 
        subject: mailOptions.subject, 
        html: mailOptions.html 
    });
};

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendBookingConfirmation = async (email, details) => {
    const { stationName, timeSlot, gasAmount, vehicleNumber } = details;
    const mailOptions = {
        from: `"CNG Gas Station" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'CNG Slot Booking Confirmed',
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #040f16; color: #cbd5e1; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
                <div style="background-color: #0a1924; padding: 30px; border-bottom: 2px solid #14b8a6; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Booking Secured!</h1>
                    <p style="color: #14b8a6; margin: 5px 0 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">CNG Bunk Network</p>
                </div>
                
                <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                        Hello! Your CNG fueling slot has been successfully reserved. Please find your booking summary below:
                    </p>
                    
                    <div style="background-color: #0d1e2b; border-radius: 12px; padding: 25px; border: 1px solid #1e293b;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Station</td>
                                <td style="padding: 10px 0; color: #ffffff; font-weight: bold; text-align: right;">${stationName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Time Slot</td>
                                <td style="padding: 10px 0; color: #14b8a6; font-weight: bold; text-align: right;">${timeSlot}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Vehicle Number</td>
                                <td style="padding: 10px 0; color: #ffffff; font-weight: bold; text-align: right;">${vehicleNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Requested Gas</td>
                                <td style="padding: 10px 0; color: #ffffff; font-weight: bold; text-align: right;">${gasAmount} Kg</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background-color: #14b8a61a; border-radius: 8px; border: 1px solid #14b8a633;">
                        <p style="margin: 0; font-size: 13px; color: #14b8a6; line-height: 1.5; text-align: center;">
                            <strong>Note:</strong> Please arrive 10 minutes before your scheduled time. Your status is currently <strong>PENDING</strong> and will be updated by the bunk administrator shortly.
                        </p>
                    </div>
                </div>
                
                <div style="background-color: #0a1924; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
                    <p style="margin: 0;">&copy; 2026 CNG Bunk Finder. Real-time Monitoring & Seamless Booking.</p>
                </div>
            </div>
        `,
    };

    return sendEmail({ 
        to: email, 
        subject: mailOptions.subject, 
        html: mailOptions.html 
    });
};
