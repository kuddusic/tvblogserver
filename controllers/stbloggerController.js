const MAX_BODY_LENGTH = 1000;
const {loggers} = require('winston');
	
const logger = loggers.get('stblogger');

function handleClientData(parsedBody, clientip) {
    debugger;
	var clientTimestamp, serverTimestamp, mac, code, model, fwVersion, component, severity, description;
	clientTimestamp = serverTimestamp = mac = code = model = fwVersion = component = severity = "<empty>"; // in case we get exception on parsing below
	try {
		clientTimestamp = new String(parsedBody.ts).substr(0, 15); // sanity check - truncate
		serverTimestamp = new Date().getTime();
		mac = new String(parsedBody.mac).substr(0, 20);
		code = new String(parsedBody.code).substr(0, 50);
		model = new String(parsedBody.model).substr(0, 25);
		fwVersion = new String(parsedBody.fw).substr(0, 15);
		component = new String(parsedBody.c).substr(0, 15);
		severity = new String(parsedBody.s).substr(0, 15);

		if(fwVersion === 'undefined') {
			fwVersion = String(parsedBody.fwVersion).substr(0, 15);
		}

		if(parsedBody.desc) {
			description = new String(parsedBody.desc).substr(0, 500);
		}

	} catch (e) {
		console.warn("Exception when parsing client data: " + e);
    }
    debugger;
	var outputString = serverTimestamp + "; " + clientTimestamp + "; " + mac + "; " + code + "; " + model + "; " + fwVersion + "; " + clientip +"; "+ component+ "; " + severity+"; " + (description ? description + "; ": "");

    
    logger.info(outputString);  
    //console.info("STBLOG:" + outputString);  
  
}

module.exports.logevent = function(req,resp){
    debugger;
    
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
        //console.warn("request body:" + body);
        //console.warn("express request body:" + req.body);        
        
        debugger;        
        if (body.length && body.length > MAX_BODY_LENGTH) {
            console.warn("Got invalid request form client with IP=" + clientIpAddress + ". Body length was: " + body.length);
            sendInvalidResponse(400, "Invalid request");
            return;
        }
        try {            
            debugger;
            if (body.ts && body.mac && body.code) {
                sendDefaultResponse();
                handleClientData(body, clientIpAddress);
            } else {
                sendInvalidResponse(400, "Missing parameter");
            }
        } catch (e) {
            console.warn("Got invalid request form client with IP=" + clientIpAddress + ". Body was: " + body);
            sendInvalidResponse(400, "Invalid request");
            return;
        }

        
    } else {
        sendInvalidResponse(400, "Invalid request2");
    }
}


