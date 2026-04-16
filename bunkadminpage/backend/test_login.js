const http = require('http');
async function test() {
    const req = http.request('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
            console.log(res.statusCode, rawData);
        });
    });
    req.write(JSON.stringify({ email: 'test@example.com', password: 'password', captchaId: '123', captchaAnswer: '123' }));
    req.end();
}
test();
