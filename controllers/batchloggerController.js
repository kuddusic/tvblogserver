const MAX_BODY_LENGTH = 5000;
const {loggers} = require('winston');
	
const logger = loggers.get('batchlogger');

function handleClientData(jb, clientip,req) {
    
	var loggerName, level, sequence, message, clientTimestamp, referer,subscriber ;
    loggerName, level, sequence, message, clientTimestamp, referer,subscriber = "<empty>"; // in case we get exception on parsing below
    //var url = new URL(url_string);
    var userId = "";
    var deviceId = "";
    if (req.query.__user) {
        userId = req.query.__user;
    } 
    
    if (req.query.__device) {
        deviceId = req.query.__device;
    }
   
    
    referer = req.get('Referer');
    var auth_headers = req.get("Authorization");
    if (auth_headers) {
        var re=/(\w+)[:=] ?"?(\w+)"?/g ;
        var foundArray = auth_headers.match(re); //returns array of key=value s.
        subscriber = foundArray[0].split("=")[1].replace(/"/g,'');
    }
    else {
        if (userId.length>1) {
            if (userId.substr(0,2)=="SU") {
                subscriber = userId.substr(2);
            }
            else if (userId.substr(0,21)=="com.ericsson.iptv.iap") {
                subscriber = userId.split("_")[1];
            }
            else {
                subscriber = userId.substr(2);
            }
        }
        else {
            subscriber = "";
        }
    }
    
    batch = jb.batch; 
    
    serverTimestamp = new Date().getTime();
    
	try {
        for(var i in batch) {
            loggerName = batch[i].logger;
            level = batch[i].level;
            sequence = batch[i].sequence;
            message = batch[i].message;  
            message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');        
            clientTimestamp = batch[i].timestamp; 
                 
            timeStr = new Date(clientTimestamp).toISOString().replace(/[T]/g,' ').replace(/[Z]/g,'').replace(/\./,','); 
           
            if (deviceId.length>1 && userId.length>1) {
                var outputString = '['+sequence + ' ' + timeStr + '][' + deviceId +'@' + clientip + '] [' + 
                    subscriber + '] [' + userId + '] [' + referer + '] ' + message;
            }
            else {
                var outputString = '['+sequence + ' ' + timeStr + '][' + clientip + '] [' + 
                subscriber + '] [' + referer + '] ' + message;

            }
            var logLine='[#|' + timeStr + '|mmpas2|' + level + '|' + loggerName + '|0|' + outputString + '||#]'
            logger.info(logLine);
        }		
		

	} catch (e) {
		console.warn("Exception when parsing client data: " + e);
	}	
}

module.exports.logevent = function(req,resp){
    
    var sendDefaultResponse = function () {
        resp.setHeader("Connection", "close");
        resp.statusCode = 200;
        resp.end();
        //resp.end(JSON.stringify({ status: "ok" }) + "\n");
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
            console.warn("Got HUGE request form client with IP=" + clientIpAddress + ". Body length was: " + body.length);
            sendInvalidResponse(400, "Invalid request. Body is very big");
            return;
        }
        try {                  
            
            
            //params = decodeURLParams(req.url);
            if (body.batch) {
                sendDefaultResponse();
                handleClientData(body, clientIpAddress, req);
            } else {
                sendInvalidResponse(400, "Missing parameter");
            }
        } catch (e) {
            console.warn("Got invalid request form client with IP=" + clientIpAddress + ". Body was: " + JSON.stringify(body) ) ;
            sendInvalidResponse(400, "Invalid message body");
            return;
        }

        
    } else {
        sendInvalidResponse(400, "Invalid request");
    }
}


