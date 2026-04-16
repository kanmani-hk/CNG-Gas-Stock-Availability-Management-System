import { sendOTP } from './config/email.js';

async function testFunction() {
    console.log('Testing sendOTP function...');
    const result = await sendOTP('kan93095@gmail.com', '123456');
    console.log('Result:', result);
    process.exit(result ? 0 : 1);
}

testFunction();
