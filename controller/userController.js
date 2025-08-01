const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.DB;
const { v4: uuidv4 } = require('uuid');
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});
const users_db = client.db("ITWS4500Cheerios_UserAuthDatabase");
const users_collection = users_db.collection("Users");

// express-async-handler reduces the amount of try/catch blocks we will need.

// @desc Gets all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async function(req, res) {
    const users = await (await users_collection.find({}, {projection: {password: 0}})).toArray();
    if (!users?.length) return res.status(400).json({ message: "No users found" });
    res.status(200).json(users);
});

// @desc Create a user
// @route POST /users
// @access Private
const createUser = asyncHandler(async function(req, res) {
    const { username, email, password, roles } = req.body;
    if (!username || !email || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const duplicate = await users_collection.findOne({ username: username });
    if (duplicate) return res.status(409).json({ message: "This username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userInstance = {
        username: username,
        userid: uuidv4(),
        email: email,
        "password": hashedPassword,
        roles: roles,
        forum_posts: [],
        replies: [],
        active: true
    }

    const userres = await users_collection.insertOne(userInstance);
    if (userres.acknowledged) {
        res.status(201).json({ message: `New user ${username} registered.` });
    } else {
        res.status(400).json({ message: `Error creating new user.` });
    }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async function(req, res) {
    const { id, username, email, roles, forum_posts, active, password } = req.body;
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const objectId = ObjectId.isValid(id) ? ObjectId.createFromHexString(id) : null;
    if (!objectId) return res.status(400).json({ message: "Invalid user ID" });

    const user = await users_collection.findOne({ _id: objectId });
    if (!user) return res.status(400).json({ message: "User not found" });

    const duplicate = await users_collection.findOne({ username: username });
    // Checks for duplicates, but we want to allow updates to the original user
    // (ensures duplicates does not count for the user we are updating)
    if (duplicate && duplicate?._id.toString() !== id) return res.status(400).json({ message: "Duplicate username" });

    const updateFields = {
        username,
        roles,
        active
    };

    if (password) {
        // rehash
        updateFields.password = await bcrypt.hash(password, 10);
    }

    if (email) {
        updateFields.email = email;
    }

    if (forum_posts) {
        updateFields.forum_posts = forum_posts;
    }
    
    const updatedUser = await users_collection.updateOne(
        { _id: objectId },
        { $set: updateFields }
    );

    res.status(201).json({ message: `${user.username} updated.` });
});

// @desc Delete a user
// @route GET /users
// @access Private
const deleteUser = asyncHandler(async function(req, res) {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "User ID Required" });

    const objectId = ObjectId.isValid(id) ? ObjectId.createFromHexString(id) : null;
    if (!objectId) return res.status(400).json({ message: "Invalid user ID" });

    const user = await users_collection.findOne({ _id: objectId });
    if (!user) return res.status(400).json({ message: "User not found" });

    const result = await users_collection.deleteOne({ _id: objectId });
    res.status(204).json({ message: `User associated with ${objectId} deleted.` })
});

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}