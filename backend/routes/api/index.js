// backend/routes/api/index.js
const express = require('express');
const router = require('express').Router();


const spotsRouter = require('./spots');
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const reviewsRouter = require('./reviews.js');
const bookingsRouter = require('./bookings.js');
const reviewImagesRouter = require('./reviewImages.js');
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null

  router.use(restoreUser);
  router.use('/session', sessionRouter);
  router.use('/users', usersRouter);
  router.use('/reviews', reviewsRouter);
  router.use('/bookings', bookingsRouter);
  router.use('/spots', spotsRouter);
  router.use('/reviewImages', reviewImagesRouter);



router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
  });

// exports
module.exports = router;
