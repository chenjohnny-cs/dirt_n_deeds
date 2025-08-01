const asyncHandler = require('express-async-handler');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

const forum_db = client.db("ITWS4500Cheerios_ForumDatabase");
const forum_collection = forum_db.collection("Forum");
const replies_collection = forum_db.collection("Replies");

// @desc Gets all forums
// @route GET /forum
// @access Private
const getAllForums = asyncHandler(async function(req, res) {
    const forums = await (await forum_collection.find()).toArray();
    if (!forums?.length) return res.status(400).json({ message: "No forum found" });
    res.status(200).json(forums);
});

// @desc Gets all forums by search query
// @param query
// @route GET /forum/search/:query
// @access Private
const getForumByQuery = asyncHandler(async function(req, res) {
    const query = req.params.query;
    if (!query) return res.status(400).json({ message: "All fields are required" });

    const regex = new RegExp(query, 'i');

    const forums = await (await forum_collection.find({
        ["forum-header"]: { $regex: regex } 
    }
    )).toArray();

    if (!forums?.length) return res.status(400).json({ message: "No forum found" });
    res.status(200).json(forums);
});

// @desc Gets all forums by a certain user
// @param query
// @route GET /forum/user/:username
// @access Private
const getForumByUser = asyncHandler(async function(req, res) {
    const username = req.params.username;
    if (!username) return res.status(400).json({ message: "All fields are required" });

    const foundUser = await users_collection.findOne({username: username});
    if (!foundUser) return res.status(490).json({ message: 'User not found' });
    const user_forum_posts = await (await forum_collection.find({
        _id: { $in: foundUser.forum_posts }
    })).toArray();

    if (!user_forum_posts?.length) return res.status(400).json({ message: "User has no forums" });
    res.status(200).json(user_forum_posts);
});

// @desc Gets all replies by a certain user
// @param query
// @route GET /forum/reply/user/:username
// @access Private
const getRepliesByUser = asyncHandler(async function(req, res) {
    const username = req.params.username;
    if (!username) return res.status(400).json({ message: "All fields are required" });

    const foundUser = await users_collection.findOne({username: username});
    if (!foundUser) return res.status(490).json({ message: 'User not found' });

    const user_reply_posts = await (await replies_collection.find({
        _id: { $in: foundUser.replies }
    })).toArray();

    if (!user_reply_posts?.length) return res.status(400).json({ message: "User has no replies" });
    res.status(200).json(user_reply_posts);
});

// @desc Gets a forum
// @param id
// @route GET /forum/:id
// @access Private
const getForum = asyncHandler(async function(req, res) {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "All fields are required" });

    const objectId = ObjectId.isValid(id) ? ObjectId.createFromHexString(id) : null;
    if (!objectId) return res.status(400).json({ message: "Invalid Forum ID" });

    const document = await forum_collection.findOne({_id: objectId});
    if (!document) return res.status(400).json({ message: "Document cannot be found" });

    res.status(200).json(document);
});

// @desc Gets a forum reply
// @param id
// @route GET /forum/reply/:id
// @access Private
const getForumReplies = asyncHandler(async function(req, res) {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "All fields are required" });

    const objectId = ObjectId.isValid(id) ? ObjectId.createFromHexString(id) : null;
    if (!objectId) return res.status(400).json({ message: "Invalid Forum ID" });

    const document = await forum_collection.findOne({_id: objectId});
    if (!document) return res.status(400).json({ message: "Document cannot be found" });

    const cursor = await replies_collection.find({
        _id: { $in: document.replies }
    });
    const replies = await cursor.toArray();
    res.status(200).json(replies);
});


// @desc Create a forum
// @route POST /forum
// @access Private
const createForum = asyncHandler(async function(req, res) {
    const { forum_header, forum_desc, username } = req.body
    if (!forum_header || !forum_desc || !username) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const forumInstance = {
        ["forum-header"]: forum_header,
        ["forum-desc"]: forum_desc,
        username: username,
        replies: [],
        ["date-created"]: (new Date()).toString()
    }

    const foundUser = await users_collection.findOne({username: username});
    if (!foundUser) return res.status(490).json({ message: 'User not found' });

    const forum_res = await forum_collection.insertOne(forumInstance);
    const user_res = await users_collection.updateOne(
        { username: username },
        { $push : { forum_posts: forum_res.insertedId } }
    );
    
    if (forum_res.acknowledged && user_res.acknowledged) {
        if (req.app.io) {
            req.app.io.emit('forumCreated', {...forumInstance, id: forum_res.insertedId});
        }
        res.status(201).json({ message: `Forum post { ${forum_res.insertedId} } created.`});
    } else {
        res.status(400).json({ message: 'Error creating new forum post' });
    }
});

// @desc Create a reply to a forum
// @route POST /forum/reply/:id
// @access Private
const createReply = asyncHandler(async function(req, res) {
    const { reply_desc, username } = req.body
    const id = req.params.id;
    if (!reply_desc || !username || !id) return res.status(400).json({ message: "All fields are required" });

    const replyInstance = {
        ["reply-desc"]: reply_desc,
        username: username,
        ["date-created"]: (new Date()).toString()
    }

    const reply_res = await replies_collection.insertOne(replyInstance);
    if (!reply_res.acknowledged) {
        res.status(400).json({ message: "Error creating new reply" });
    }

    const objectId = ObjectId.isValid(id) ? ObjectId.createFromHexString(id) : null;
    if (!objectId) return res.status(400).json({ message: "Invalid Forum ID" });

    const foundUser = await users_collection.findOne({username: username});
    if (!foundUser) return res.status(490).json({ message: 'User not found' });

    const forum_res = await forum_collection.updateOne(
        { _id: objectId },
        { $push : { replies: reply_res.insertedId } }
    );

    const user_res = await users_collection.updateOne(
        { username: username },
        { $push : { replies: reply_res.insertedId } }
    );

    if (forum_res.acknowledged && user_res.acknowledged) {
        if (req.app.io) {
            req.app.io.emit('replyCreated', {...replyInstance, id: reply_res.insertedId});
        }
        res.status(201).json({ message: `Successfully replied to post {${id}}.` });
    } else {
        res.status(400).json({ message: "Error replying to forum post." });
    }
});

// @desc Updates a forum
// @param id
// @route PATCH /forum/:id
// @access Private
const updateForum = asyncHandler(async function(req, res) {
    const { forum_header, forum_desc } = req.body
    const id = req.params.id;
    if (!forum_header || !forum_desc || !id) return res.status(400).json({ message: 'All fields are required' });

    const objectId = ObjectId.isValid(id) ? ObjectId.createFromHexString(id) : null;
    if (!objectId) return res.status(400).json({ message: "Invalid Forum ID" });

    const post = await forum_collection.findOne({ _id: objectId });
    if (!post) return res.status(400).json({ message: "Forum post not found" });

    const updateFields = {
        ["forum-header"]: forum_header,
        ["forum-desc"]: forum_desc
    };

    const updatedForum = await forum_collection.updateOne(
        { _id: objectId },
        { $set: updateFields }
    )
    res.status(201).json({ message: `Forum associated with ${objectId} updated.`});
});

// @desc Deletes whole forum
// @route DELETE /forum
// @access Private
const deleteAllForum = asyncHandler(async function(req, res) {
    const posts = await (await forum_collection.find()).toArray();
    if (!posts?.length) return res.status(400).json({ message: "Forum not found" });

    const result = await forum_collection.deleteMany({});

    // need to also delete all replies associated to posts
    let replies = [];
    for (post_index in posts) {
        if (posts[post_index].replies?.length) {
            const del_res = await replies_collection.deleteMany({ _id: { $in: posts[post_index].replies } });
            const user_del_res = await users_collection.updateMany(
                {},
                {
                    $set: {
                        forum_posts: [],
                        replies: []
                    }
                }
            )
        }
    }

    if (req.app.io) {
        req.app.io.emit('forumPurged', {});
    }
    res.status(204).json({ message: `Forum purged. ${result.deletedCount} documents deleted.` });
});

// @desc Deletes a forum
// @param id
// @route DELETE /forum/:id
// @access Private
const deleteForum = asyncHandler(async function(req, res) {
    const { username } = req.body
    const id = req.params.id;
    if (!id || !username) return res.status(400).json({ message: "All fields are required" });

    const objectId = ObjectId.isValid(id) ? ObjectId.createFromHexString(id) : null;
    if (!objectId) return res.status(400).json({ message: "Invalid Forum ID" });

    const post = await forum_collection.findOne({ _id: objectId });
    if (!post) return res.status(400).json({ message: "Forum post not found" });

    const foundUser = await users_collection.findOne({username: username});
    if (!foundUser) return res.status(490).json({ message: 'User not found' });

    if (post.replies?.length) {
        await replies_collection.deleteMany({ _id: { $in: post.replies } });
        await users_collection.updateOne(
            { username: username },
            {
                $pull: {
                    forum_posts: objectId,
                    replies: { $in: post.replies }
                }
            }
        )
    } else {
        await users_collection.updateOne(
            { username: username },
            {
                $pull: {
                    forum_posts: objectId,
                }
            }
        )
    }

    if (req.app.io) {
        req.app.io.emit('userDeletedForum', {});
    }

    const result = await forum_collection.deleteOne({ _id: objectId });
    res.status(204).json({ message: `Forum Post associated with ${objectId} deleted.` });
});

// @desc Deletes a reply
// @param id
// @route DELETE /reply/:id
// @access Private

const deleteReply = asyncHandler(async function(req, res) {
    const { username } = req.body;
    const reply_id = req.params.id;
    if (!reply_id || !username) return res.status(400).json({ message: "All fields are required" });

    const reply_objectId = ObjectId.isValid(reply_id) ? ObjectId.createFromHexString(reply_id) : null;
    if (!reply_objectId) return res.status(400).json({ message: "Invalid Reply ID" });
    
    const post = await forum_collection.findOne({
        replies: reply_objectId
    });
    if (!post) return res.status(400).json({ message: "Forum post not found" });

    const foundUser = await users_collection.findOne({username: username});
    if (!foundUser) return res.status(490).json({ message: 'User not found' });

    const del_res = await forum_collection.updateOne(
        { _id: post._id },
        {
            $pull: {
                replies: reply_objectId
            }
        }
    );

    const user_del_res = await users_collection.updateOne(
        { username: username },
        {
            $pull: {
                replies: reply_objectId
            }
        }
    );

    if (req.app.io) {
        req.app.io.emit('userDeletedReply', {});
    }

    const reply_del_res = await replies_collection.deleteOne({ _id: reply_objectId });
    res.status(204).json({ message: `Reply associated with ${reply_objectId} on forum post ${forum_objectId} deleted.` });
})

const ErrorResponse = function(req, res) {
    res.status(400).json({ message: 'Internal Server Error' });
}

module.exports = {
    getAllForums,
    getForumByQuery,
    getForumByUser,
    getRepliesByUser,
    getForum,
    getForumReplies,
    createForum,
    createReply,
    updateForum,
    deleteAllForum,
    deleteForum,
    deleteReply,
    ErrorResponse
}