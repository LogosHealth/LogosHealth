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

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'LogosHealth App';

    let speechOutput = 'Welcome to Logos Health personal health records.  Who am I speaking with today??", "Welcome';

    const repromptText = 'What can I help you with?';
    const shouldEndSession = false;
    
    callback(sessionAttributes, helper.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function verifyUserExists() {
    //Check Database with profile name, if exists repond with greeting else propose a creation
    console.log('Load All User Accounts from DB called >>>>>>');
    var userAccounts = dbUtil.getAllUserAccounts();
    console.log('All Accounts are >>>>>> ${userAccounts}');
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
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    //console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    //console.log('BeforeGetWelcomeResponse');
    getWelcomeResponse(callback);
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
    else {
        throw "Invalid intent";
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
    
    var accounts = verifyUserExists(event, context, callback);
    
    console.log(" The Accounts retrieved from Database >>>>"+accounts);

    callback(sessionAttributes, helper.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function createOrUpdateAppLink (event, context, request, appID) {
    //get APP ID from helper
    var appId = helper.createOrUpdateAppLink(event, context, request, appID);
}

function handleCreateLogosHealthProfile (event, context, intent, session, callback) {
    //TODO: Implementation
    
    const sessionAttributes = {};
    const cardTitle = 'Open Profile';

    let speechOutput = 'Hello, your create profile request has been initiated", "Provide inputs';

    const repromptText = 'Creating a profile';
    const shouldEndSession = false;
    
    //TODO: Implement Create Profile DB logic here
    
    
    callback(sessionAttributes, helper.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function helpRequest (intent, session, callback) {
    //TODO: Implementation
}

function quitRequest (intent, session, callback) {
    //TODO: Implementation
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
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
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            console.log('Launch Request processing >>>>>.');
            onLaunch(event.request,event.session,
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