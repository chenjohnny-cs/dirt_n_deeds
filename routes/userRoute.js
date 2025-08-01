const express = require('express');
const router = express.Router();
const usersController = require('../controller/userController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRoles = require('../middleware/verifyRoles');
// .patch() v. .put()
//
// put replaces an entire resource with the data in the request,
// while patch only partially replaces the resource.
//
// (put updates/replaces the whole document, patch only updates specific fields, put can lead to undefined behavior)

router.route('/')
    .get(verifyJWT, usersController.getAllUsers)    // This route is protected by verifyJWT (cant see user without logged in)
    .post(usersController.createUser)               // This route is not protected by verifyJWT (anyone can create an account)
    .patch(verifyJWT, usersController.updateUser)   // This route is protected by verifyJWT (cant update without logged in)
    .delete(verifyJWT, usersController.deleteUser)  // This route is protected by verifyJWT (cant delete without logged in)

module.exports = router