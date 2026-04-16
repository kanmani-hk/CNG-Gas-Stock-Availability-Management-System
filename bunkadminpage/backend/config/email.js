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
                    <h2 style="color: #ffffff; margin-bottom: 10px; font-size: 20px;">Bunk Admin Verification</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #94a3b8; margin-bottom: 25px;">
                        Confirm your identity to manage your station assets <br/>
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

    const isPlaceholder = !process.env.EMAIL_USER ||
        process.env.EMAIL_USER === 'your-email@gmail.com' ||
        !process.env.EMAIL_PASS ||
        process.env.EMAIL_PASS === 'your-16-char-app-password';

    if (!isPlaceholder) {
        try {
            await transporter.sendMail(mailOptions);
            console.log(`OTP sent to ${email}`);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    } else {
        console.warn('EMAIL_USER or EMAIL_PASS not set correctly in .env. Falling back to console log.');
        console.log(`[OTP FALLBACK] To: ${email} | OTP: ${otp}`);
        return true;
    }
};


export const sendBookingNotification = async (email, driverName, status, stationName, timeSlot) => {
    let statusColor = '#14b8a6';
    let statusTitle = 'Booking Status Update';
    let statusMessage = '';

    if (status === 'pending') {
        statusColor = '#64748b';
        statusTitle = 'Booking Request Received';
        statusMessage = `Your fuel booking request at <strong>${stationName}</strong> for the slot <strong>${timeSlot}</strong> has been received and is currently <strong>pending</strong> approval.`;
    } else if (status === 'confirmed') {
        statusColor = '#10b981';
        statusTitle = 'Booking Confirmed';
        statusMessage = `Your fuel booking at <strong>${stationName}</strong> for the slot <strong>${timeSlot}</strong> has been confirmed! Please arrive on time.`;
    } else if (status === 'completed') {
        statusColor = '#3b82f6';
        statusTitle = 'Booking Completed';
        statusMessage = `Your fuel refill at <strong>${stationName}</strong> is complete. Thank you for using CNG Bunk Finder!`;
    } else if (status === 'cancelled') {
        statusColor = '#ef4444';
        statusTitle = 'Booking Cancelled';
        statusMessage = `Your fuel booking at <strong>${stationName}</strong> has been cancelled. Please contact the station or book another slot.`;
    }

    const mailOptions = {
        from: `"CNG Gas Station" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `${statusTitle} - ${stationName}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #040f16; color: #cbd5e1; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background-color: #0a1924; border: 2px solid ${statusColor}; border-radius: 12px; line-height: 60px; font-size: 30px;">⛽</div>
                    <h1 style="color: ${statusColor}; margin-top: 15px; font-size: 24px; letter-spacing: -0.5px;">CNG Bunk Finder</h1>
                </div>
                
                <div style="background-color: #0a1924; padding: 30px; border-radius: 12px; border: 1px solid #1e293b; text-align: center;">
                    <h2 style="color: #ffffff; margin-bottom: 15px; font-size: 20px;">Hi ${driverName},</h2>
                    <div style="background-color: ${statusColor}22; padding: 20px; border-radius: 8px; border: 1px solid ${statusColor}44; margin-bottom: 25px;">
                        <p style="font-size: 16px; line-height: 1.6; color: #ffffff; margin: 0;">
                            ${statusMessage}
                        </p>
                    </div>
                    
                    <p style="font-size: 13px; color: #64748b;">
                        Station: <strong>${stationName}</strong> <br/>
                        Status: <strong style="color: ${statusColor}; text-transform: uppercase;">${status}</strong>
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #475569; font-size: 12px;">
                    <p>&copy; 2026 CNG Bunk Finder. All rights reserved.</p>
                </div>
            </div>
        `,
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
            console.error('Error sending booking notification:', error);
            return false;
        }
    } else {
        console.log(`[BOOKING NOTIFICATION FALLBACK] To: ${email} | Status: ${status}`);
        return true;
    }
};

export const sendAdminBookingAlert = async (adminEmail, bookingDetails, stationName) => {
    const mailOptions = {
        from: `"CNG System Alert" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Booking Activity: ${stationName}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #040f16; color: #cbd5e1; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #14b8a6; margin-top: 15px; font-size: 24px;">Admin Alert - New Activity</h1>
                </div>
                <div style="background-color: #0a1924; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
                    <h2 style="color: #ffffff; margin-bottom: 15px; font-size: 18px;">Booking Process Update</h2>
                    <p style="color: #94a3b8; font-size: 15px;">
                        A booking action has been performed at <strong>${stationName}</strong>.
                    </p>
                    <div style="background-color: #040f16; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <p style="margin: 5px 0;"><strong>Driver:</strong> ${bookingDetails.driverName}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${bookingDetails.driverEmail}</p>
                        <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${bookingDetails.vehicleNumber}</p>
                        <p style="margin: 5px 0;"><strong>Slot:</strong> ${bookingDetails.timeSlot}</p>
                        <p style="margin: 5px 0;"><strong>Current Status:</strong> <span style="color: #14b8a6; font-weight: bold; text-transform: uppercase;">${bookingDetails.status}</span></p>
                    </div>
                </div>
            </div>
        `,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-email@gmail.com') {
        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending admin alert:', error);
            return false;
        }
    }
    return true;
};

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
