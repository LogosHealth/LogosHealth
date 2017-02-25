'use strict';

var dbUtil = require('./utils/DBUtils');
var helper = require('./utils/LogosHelper');
var request = require('request');

// --------------- Functions that control the skill's behavior -----------------------
function onLaunch(event, launchRequest, session, callback) {
	
	//getAccountLinkName(event, data, callback);
	accountEmail(event, request, session, accountId, callback);
}

function accountId(error, data, session, callback) {
    if (error) throw error;
    console.log(" The Email found from account is "+data.email);
    dbUtil.getAccountIdFromEmail(data.email, session, callback);
}

function accountEmail(event, request, session, accountId, callback) {
    console.log(" Getting Account Linked Email ");
	
	var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
    amznProfileURL += event.session.user.accessToken;
    
    request(amznProfileURL, function(error, response, body) {
 	    var respBody = "";
 	    if (!error && response.statusCode == 200) {
    	    respBody = JSON.parse(body);
    	    console.log('Email from Amazon: ' + respBody.email);
	    }
	    accountId(error,respBody, session, callback);
	});
};


function handleSessionEndRequest(callback) {
    helper.processSessionEnd(callback);
}

/**
 * Called when the session starts.
 */
function onSessionStarted(event, sessionStartedRequest, session) {
    console.log('onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}');
}

function onSessionEnded(sessionEndedRequest, session) {
    console.log('onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}');
    
}
// --------------- Main handler -----------------------
exports.handler = (event, context, callback) => {
    try {
        
        if (event.session.new) {           
            console.log('New Session created >>>>>');
            onSessionStarted(event,{ requestId: event.request.requestId }, event.session);
            onLaunch(event,event.request,event.session,
                    (sessionAttributes, speechletResponse) => {
                        callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                    });
        } else {
        
            if (event.request.type === 'LaunchRequest') {
                console.log('Launch Request processing >>>>>.');
                onLaunch(event,event.request,event.session,
                    (sessionAttributes, speechletResponse) => {
                        callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                    });
            } else if (event.request.type === 'IntentRequest') {
                console.log('Intent Request processing >>>>>');
                helper.processUserReponse(event, context, event.request,event.session,
                    (sessionAttributes, speechletResponse) => {
                        callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                    });            
            } else if (event.request.type === 'SessionEndedRequest') {
                console.log('SessionEndedRequest >>>>>>');
                onSessionEnded(event.request, event.session);
                callback();
            }}
        } catch (err) {
            callback(err);
    }
};