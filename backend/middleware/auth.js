import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    // Get token from header
    // Support both x-auth-token (legacy) and Authorization: Bearer <token>
    let token = req.header('x-auth-token');

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // decoded might involve 'user' block or just id depending on generation
        // generateToken.js uses { id }, so decoded is { id, iat, exp }
        // The legacy middleware expected 'decoded.user'. 
        // We must check how the token was generated. 
        // If my generateToken.js just signs { id }, then req.user should be { id: decoded.id }

        req.user = decoded.user || decoded;
        // If decoded is just { id: '...', ... }, then req.user.id works.
        // If decoded is { user: { id: '...' } }, then req.user.id works.
        // We need to be careful.

        // Let's assume standard object
        next();
    } catch (err) {
        console.error("Auth Token Error:", err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

export default auth;
