var express = require('express');
var router = express.Router();
var controller = require('../controllers/ratingController');

function rawBody(req, res, next) {
    req.setEncoding('utf8');
    req.body = '';
    req.on('data', function(chunk) {
      req.body += chunk;
    });
    req.on('end', function(){
      next();
    });
  };

router.use(rawBody);
/*
router.use(function(req,res,next){
    console.log("Batch Logger URL: "+ req.url);    
    //req.deneme = "Merhaba";
    next();
});
*/

router.post('/sendChannelEvents.ajax', controller.logevent);
router.post('/sendVodEvents.ajax', controller.logevent);
router.post('/*', controller.logevent);

module.exports = router; 