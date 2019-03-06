
const MAX_BODY_LENGTH = 5000;
const {loggers} = require('winston');
	
const logger = loggers.get('sendeventslogger');


function handleClientData(jb, clientip,req) {
    
	var eventData, clientTimestamp, referer,subscriber, eventTypeName;
    eventData, clientTimestamp, referer,subscriber, eventTypeName = "<empty>"; // in case we get exception on parsing below
    //var url = new URL(url_string);
    debugger;
    var userId = req.query.__user;
    var deviceId = req.query.__device;
    referer = req.get('Referer');
    var auth_headers = req.get("Authorization");
    if (auth_headers) {
        var re=/(\w+)[:=] ?"?(\w+)"?/g ;
        var foundArray = auth_headers.match(re); //returns array of key=value s.
        subscriber = foundArray[0].split("=")[1].replace(/"/g,'');
    } 
    else {
        if (userId.slice(0,2)=='SU') {
            subscriber = userId.slice(2);
        }
        else if (userId.slice(0,22)=='com.ericsson.iptv.iap_') {
            subscriber = userId.split("_")[1];
        }
        else {
            subscriber = userId;
        }
    }
    batch = jb.events; 
    
    //serverTimestamp = new Date().getTime();
    
	try {
        for(var i in batch) {           
            clientTimestamp = batch[i].dateTime; 
            eventTypeName = batch[i].eventTypeName;
            eventData = batch[i].eventData; 
            userId = batch[i].userId;                             
                 
            timeStr = new Date(clientTimestamp).toISOString().replace(/[Z]/g,'').replace(/\./,',').slice(0,-4) + '+0000';            
           
            var logLine= timeStr + ',' + userId + ',' + deviceId + ',' + subscriber + ',' + eventTypeName + ',' + eventData.join(";")
            logger.info(logLine);
            // 2018-11-30T05:30:00+0000,SU365220201,365220201_20180920123811_0,365220201,TTG_WATCHING_CHANNEL,ARABESK;ARABESK;IP7616-PMC
        }		
		

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
            
            
            //params = decodeURLParams(req.url);
            if (body.events && req.query.__device && req.query.__user) {
                sendDefaultResponse();
                handleClientData(body, clientIpAddress, req);
            } else {
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


