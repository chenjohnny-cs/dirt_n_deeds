const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});
const users_db = client.db("ITWS4500Cheerios_UserAuthDatabase");
const users_collection = users_db.collection("Users");

// @desc Login
// @route POST /auth
// @access public
const login = asyncHandler(async function(req, res) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'All fields are required'});
    
    const foundUser = await users_collection.findOne({username: username});
    if (!foundUser) return res.status(401).json({ message: 'Unauthorized' });

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return res.status(401).json({ message: 'Unauthorized' });

    // JWT
    //
    // Essentially, JWT is referenced as a form of identification, which is 
    // issued after the user authentication.
    //
    // When a user completes a login and they are authenticated, our Rest API
    // will issue the client app an access token and refresh token.

    // Creates an Access Token
    //
    // Keep this at short time (5m - 15m).
    // Access Tokens are JSOn, and stored in memory which means these
    // tokens are forgotten when our app closes.
    //
    // This allows our client to use our API until access expires.
    // Our REST API will verify this token each time when the user
    // accesses some part of our app, when this token does expire
    // the user need to send the refresh token to get a new one.
    //
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "userid": foundUser.userid,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s' }
    );

    // Creates a Refresh Token:
    //
    // Stored in an httpOnly cookie
    // Makes in unable to be accesed through jS.
    // Always have an expiry date.
    //
    // This is verified at our endpoints and must expire or logout.
    // Used to request a new access token.
    //
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    // Create a secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessable only by web server
        secure: true,  // https
        sameSite: 'None', // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to match refresh token (7 days)
    });

    // Send our accessToken cointaing the username and roles back to client
    res.json({ accessToken });
});

// @desc Refresh -- If access token has expired
// @route GET /auth/refresh
// @access Public
const refresh = function(req, res) {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async function(e, decoded) {
            if (e) return res.status(403).json({ message: 'Forbidden' });

            const foundUser = await users_collection.findOne({username: decoded.username});
            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' });

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "userid": foundUser.userid,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10m' }
            );

            res.json({ accessToken });
        })
    )
};

// @desc Logout -- Clears cookies if one does exist
// @route POST /auth/logout
// @access Public
const logout = function(req, res) {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });
    res.clearCookie('jwt', { 
        httpOnly: true, 
        sameSite: 'None', 
        secure: true
    });
    res.status(200).json({ message: 'Cookie Cleared'});
};

module.exports = {
    login,
    refresh,
    logout
};