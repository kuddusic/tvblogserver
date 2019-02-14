const MAX_BODY_LENGTH = 5000;
const {loggers} = require('winston');
	
const logger = loggers.get('ratinglogger');

function handleClientData(clientip,req) {
     //serverTimestamp = new Date().getTime();
    
	try {
        var outputString = 'POST ' + req.originalUrl+ ';' + JSON.stringify(req.body);
        debugger;
        logger.info(outputString);
    } catch (e) {
		console.warn("Exception when parsing client data: " + e);
	}	
}

module.exports.logevent = function(req,resp){
    
    var sendDefaultResponse = function () {
        resp.setHeader("Connection", "close");
        resp.statusCode = 200;
        resp.end(JSON.stringify({ status: "ok" }) + "\n");
    };

    var sendInvalidResponse = function (errorCode, errorMessage) {
        resp.statusCode = errorCode;
        resp.end(JSON.stringify({ status: "error", errorCode: errorCode, "message": errorMessage }) + "\n");
    };

    var clientIpAddress;
    try {
        clientIpAddress = req.headers["x-forwarded-for"]; // Actual IP of client, set by load balancer
        if (!clientIpAddress) {
            if (req.socket.remoteAddress) {
                clientIpAddress = req.socket.remoteAddress;				
            } else {
                clientIpAddress = "no_ip_available"
            }
        }

    } catch (e2) {
        clientIpAddress = "no_ip_available_exc: " + e2;
    }

    if (req.method === "POST") {
        var body = req.body;        
        //console.warn("express request body:" + req.body);        
        debugger;                
        if (body.length && body.length > MAX_BODY_LENGTH) {
            console.warn("Got invalid request form client with IP=" + clientIpAddress + ". Body length was: " + body.length);
            sendInvalidResponse(400, "Invalid request. Body is very big");
            return;
        }
        try {              
            if (req.query.__device && req.query.__user) { // Additional controls.
                sendDefaultResponse();
                handleClientData(clientIpAddress, req);
            } else {
                console.warn("Missing parameter. URL: " + req.originalUrl);
                sendInvalidResponse(400, "Missing parameter");
            }
        } catch (e) {
            console.warn("Got invalid request form client with IP=" + clientIpAddress + ". Body was: " + body);
            sendInvalidResponse(400, "Invalid message body");
            return;
        }

        
    } else {
        sendInvalidResponse(400, "Invalid request");
    }
}


