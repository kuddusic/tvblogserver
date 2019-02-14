var express = require('express');
var router = express.Router();
var controller = require('../controllers/ratingController');

/*
router.use(function(req,res,next){
    console.log("Batch Logger URL: "+ req.url);    
    //req.deneme = "Merhaba";
    next();
});
*/

router.post('/sendChannelEvents.ajax', controller.logevent);
router.post('/sendVodEvents.ajax', controller.logevent);

module.exports = router; 