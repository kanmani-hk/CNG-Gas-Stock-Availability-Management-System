import express from 'express';
const app = express();
app.get('/test', (req, res) => res.send('OK'));
app.listen(5000, () => console.log('Listening on 5000'));
