var express = require('express');
var router = express.Router();
var controller = require('../controllers/sendEventsController');

/*
router.use(function(req,res,next){
    console.log("Batch Logger URL: "+ req.url);    
    //req.deneme = "Merhaba";
    next();
});
*/

router.post('/sendEvents.ajax', controller.logevent);
router.post('/*', controller.logevent);
module.exports = router; 