var express = require('express');
var router = express.Router();
var controller = require('../controllers/batchloggerController');

/*
router.use(function(req,res,next){
    console.log("Batch Logger URL: "+ req.url);    
    //req.deneme = "Merhaba";
    next();
});
*/

router.post('/*', express.json({limit: '50kb'}),controller.logevent);

module.exports = router; 