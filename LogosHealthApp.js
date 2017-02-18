'use strict';

/**
 * LogosHealth App Request Handler. This Action class reviews Alexa AVS commands and provides a response.
 * Supports an interactive mode from Alexa
 * Persists user inputs
 * Provides options based on LogosHealth App
 */


//global variables & Utils classes to import
var dbUtil = require('./utils/DBUtils');
var helper = require('./utils/LogosHelper');
var request = require('request');

var test = "";

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {currentProcessor: 0};
    const cardTitle = 'LogosHealth App';

    let speechOutput = 'Logos Health personal health records.  Who am I speaking with today?", "Welcome';

    const repromptText = 'What can I help you with?';
    const shouldEndSession = false;
    
    callback(sessionAttributes, helper.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function identifyUser(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
     console.log(' Identifying User >>>>>>');
    const sessionAttributes = {currentProcessor: 1};
    const cardTitle = 'LogosHealth App';
    var userName = dbUtil.verifyUserProfile();
    let speechOutput = "";
    
    if (userName === null || userName.length == 0) {
    	speechOutput = 'Hello I could not found your profile. Would like to create one?';
    } else {
    	speechOutput = 'Hello '+userName+ ' How are you today? How can I help you?';
    }

    const repromptText = 'Menu Options';
    const shouldEndSession = false;
    
    callback(sessionAttributes, helper.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function processUserReponse(event, request, session, callback) {
    console.log('Generic User response has been triggered >>>>>>');
    var sessionAttributes = session.attributes;
    
    switch (sessionAttributes.currentProcessor) {
    case 0:
        identifyUser(callback);
        break;
    case 1:
        //process method
        break;
    case 2:
        //process method
        break;
    case 3:
        //process method
        break;
    case 4:
        //process method
        break;
    case 5:
        //process method
        break;
    default: getWelcomeResponse(callback);
    }
    
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, helper.buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


// --------------- Events -----------------------



/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(event, launchRequest, session, callback) {
    //console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    //console.log('BeforeGetWelcomeResponse');
    identifyUser(callback);
    //console.log('AfterGetWelcomeResponse: ' + callback);
}


/**
 * Called when the user specifies an intent for this skill.
 */
function processIntent(event, context, intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);
 
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;
 
 
    // dispatch custom intents to handlers here
    if (intentName == 'OpenLogosHealthProfile') {
        handleOpenLogosHealthProfile(event, context,intent, session, callback);
    }    
    else if (intentName == 'CreateLogosHealthProfile') {        
	    handleCreateLogosHealthProfile(event, context, intent, session, callback);    
    } 
    else if (intentName == 'AMAZON.HelpIntent') {        
	    helpRequest(intent, session, callback);    
    }    
    else if (intentName == 'AMAZON.CancelIntent')  {        
	    quitRequest(intent, session, callback);  
    }
    else if (intentName == 'LaunchIntent')  {        
	    processUserReponse(event, intent, session, callback);  
    }
    else {
        //throw "Invalid intent";
        processUserReponse(event, intent, session, callback);
    }
}

/*
* Intent handlers, TODO: Implement
*/

function handleOpenLogosHealthProfile (event, context, intent, session, callback) {
    
    const sessionAttributes = {};
    const cardTitle = 'Open Profile';

    let speechOutput = 'Hello Marty, How are you today?", "Welcome to Logos Health App';

    const repromptText = 'Opening a profile';
    const shouldEndSession = false;
    
    var accounts = dbUtil.getAllUserAccounts();
    
    console.log(" The Accounts retrieved from Database >>>>"+accounts);

    callback(sessionAttributes, helper.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function checkUserMainProfileExists (event, session, callback) {
    const sessionAttributes = {};
    const cardTitle = 'Open Profile';

    let speechOutput = 'Hello Marty, How are you today?", "Welcome to Logos Health App';

    const repromptText = 'Opening a profile';
    const shouldEndSession = false;
    var isExists = helper.verifyUserProfile("","");
}

function handleCreateLogosHealthProfile (event, context, intent, session, callback) {
    //TODO: Implementation
    
    const sessionAttributes = {};
    const cardTitle = 'Open Profile';

    let speechOutput = 'Hello, your create profile request has been initiated", "Provide inputs';

    const repromptText = 'Creating a profile';
    const shouldEndSession = false;
    
    //TODO: Implement Create Profile DB logic here
    //dbUtil.createHealthProfile(passparams);
    
    callback(sessionAttributes, helper.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function helpRequest (intent, session, callback) {
    //TODO: Implementation
}

function quitRequest (intent, session, callback) {
    //TODO: Implementation
}

function getAccountLinkName (event) {
	var appName = "";
	var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
    amznProfileURL += event.session.user.accessToken;
    request(amznProfileURL, function(error, response, body) {
        if (response.statusCode == 200) {
             var profile = JSON.parse(body);
             console.log('printing profile' + profile);
             appName = profile.email;
             console.log("LogosHelper >>>> Profile is  " + profile.toString());
             console.log("LogosHelper >>>> :Hello, " + profile.email);
                
         } else {
                console.log("LogosHelper >>>> : I can't connect to Amazon Profile Service right now, try again later");
                appName = 'NO_ID';
                
         }
     });
     
     console.log(" The Test from Account Link >>>> "+test);
     
     return appName;
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log('onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}');
    
}

/**
 * Called when the session starts.
 */
function onSessionStarted(event, sessionStartedRequest, session) {
    console.log('onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}');
    var appName = getAccountLinkName(event);
    console.log(" The App name found is >>>>>> "+test);
}

// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        //console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Populate Skill APP ID to control function calls.
         */
        
        if (event.session.new) {           
            console.log('New Session created >>>>>');
            onSessionStarted(event, { requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            console.log('Launch Request processing >>>>>.');
            onLaunch(event,event.request,event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            console.log('Intent Request processing >>>>>');
            processIntent(event, context, event.request,event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                });
            
        } else if (event.request.type === 'SessionEndedRequest') {
            console.log('SessionEndedRequest >>>>>>');
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};