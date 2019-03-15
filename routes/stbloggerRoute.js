var express = require('express');
var router = express.Router();
var controller = require('../controllers/stbloggerController');

/*
router.use(function(req,res,next){
    console.log("STB Logger URL: "+ req.url);    
    //req.deneme = "Merhaba";
    next();
});
*/

router.post('/logevent', express.json(), controller.logevent);

module.exports = router; 