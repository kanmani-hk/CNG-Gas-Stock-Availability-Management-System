import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bunkadmin_secret_key_2026';

export function authenticateBunkAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
}
