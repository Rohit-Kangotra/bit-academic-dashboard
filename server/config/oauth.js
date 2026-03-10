const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        return payload; // contains { email, name, picture, sub, etc. }
    } catch (error) {
        console.error('Error verifying Google token:', error);
        return null;
    }
};

module.exports = {
    verifyGoogleToken,
};
