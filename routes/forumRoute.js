const express = require('express');
const router = express.Router();
const forumController = require('../controller/forumController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyRoles');

router.route('/')
    .get(forumController.getAllForums)                  // This route is not protected by verifyJWT (all users can see forum pages)
    .post(verifyJWT, forumController.createForum)       // This route is protected by verifyJWT (need acc to create forum)
    .delete(verifyJWT, verifyRoles("superuser"), forumController.deleteAllForum)  // This route is protected by verifyJWT (need acc and superuser to delete forum)

router.route('/:id')
    .get(forumController.getForum)                      // This route is not protected by verifyJWT (all users can see specific forum pages)
    .patch(verifyJWT, forumController.updateForum)                 // This route is protected by verifyJWT (need acc to update forum)
    .delete(verifyJWT, forumController.deleteForum)                // This route is protected by verifyJWT (need acc to delete your forum)

router.route('/reply/:id')
    .get(forumController.getForumReplies)               // This route is not protected by verifyJWT (all users can see replies)
    .post(verifyJWT, forumController.createReply)                  // This route is protected by verifyJWT (need acc to reply)
    .delete(verifyJWT, forumController.deleteReply)     // This route is protected by verifyJWT (need acc to delete reply)

router.route('/reply/user/:username')
    .get(verifyJWT, forumController.getRepliesByUser)

router.route('/search/:query')
    .get(forumController.getForumByQuery)       // This route is not protected by verifyJWT (all users can search and view the forum)

router.route('/user/:username')
    .get(verifyJWT, forumController.getForumByUser)

    

module.exports = router