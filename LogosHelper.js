/**
 * LogosHealth Application Utils. 
 * All global re-usable/utility functions listed here. Class could be expanded to cover my utils
 * JSON parsing is main 
 * Copyright Logos Health, Inc
 * 
 */

var aws = require('aws-sdk');
var request = require('request');
var dbUtil = require('./DBUtils');

/**
 * Create a new build response.
 * @param {object} [values]Session Attributes to use in add in response object
 * @param {object} Speech output
 * 
 * @public
 */
exports.buildResponse = function buildResponse(sessionAttributes, speechletResponse) {
	console.log(' LogosHelper.buildResponse >>>>>>');
	return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
    
};

/**
 * Returns APP ID for Logos Health.
 * @param {object} none
 * @return {string} Context APP ID
 * 
 * @public
 */
exports.getAppLinkName = function getAppLinkName(event) {
	console.log(' LogosHelper.buildResponse >>>>>>');
	var appId = 'amzn1.ask.skill.43a6c098-7243-4e50-9017-d080c86eee32';
    appId = getAccountLinkName(event);
	return appId;
    
};

/**
 * Returns APP ID for Logos Health.
 * @param {object} none
 * @return {string} Context APP ID
 * 
 * @public
 */
exports.processNameIntent = function processNameIntent(userName, hasProfile, session, callback) {
	console.log(' LogosHelper.processNameIntent >>>>>>');
    processUserNameInput(userName, hasProfile, session, callback);
};

/**
 * Returns APP ID for Logos Health.
 * @param {object} none
 * @return {string} Context APP ID
 * 
 * @public
 */
exports.processSessionEnd = function processSessionEnd(callback) {
	console.log(' LogosHelper.processSessionEnd >>>>>>');
    handleSessionEndRequest(callback);
};


/**
 * Provides a speech response to Alexa using JSON format.
 * @param {object|string} Title of the Speech card
 * @param {object|string} Speech output text 
 * @param {object|string} To prompt speech out text
 * @param {object|string} Whether session to be end or not
 * @return {object} A JSON object constructed with speech out text
 * @public
 */
exports.buildSpeechletResponse = function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  	console.log(' LogosHelper.buildSpeechletResponse >>>>>>');
  	return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `${title}`,
            content: `${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
};

/**
 * Method to create an App Link to from a new request.
 * @param {object|string} Event
 * @param {object|string} Context object 
 * @param {object|string} Request
 * @param {object|string} App ID
 * @return {object} Applink ID once successfully created or ERROR
 * @public
 */
exports.createApplink = function createApplink(event, context, request, appId) {
  	console.log(' LogosHelper.createApplink >>>>>>');
  	//TODO: implement code to create an App link from caller
};

/**
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.checkClassAccess = function checkClassAccess() {
  	console.log(' LogosHelper.checkClassAccess >>>>>>');
  	return true;
};

/**
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.displayWelcomeMsg = function displayWelcomeMsg(accountid, session, callback) {
  	console.log(' LogosHelper.checkClassAccess >>>>>>'+accountid);
  	getWelcomeResponse(accountid, session, callback);
};

exports.displayUnknownIntent = function displayUnknownIntent(accountid, session, callback) {
  	console.log(' LogosHelper.displayUnknownIntent >>>>>>'+accountid);
  	displayUnknownContext(accountid, session, callback);
};

exports.createProfile = function createProfile(event, context, intent, session, callback) {
  	console.log(' LogosHelper.createProfile >>>>>>');
  	handleCreateLogosHealthProfile(event, context, intent, session, callback);
};

exports.openProfile = function openProfile(event, context, intent, session, callback) {
  	console.log(' LogosHelper.openProfile >>>>>>');
  	handleOpenLogosHealthProfile(event, context, intent, session, callback);
};

exports.processUserReponse = function processUserReponse(event, context, intent, session, callback) {
  	console.log(' LogosHelper.processUserReponse >>>>>>');
  	processIntent(event, context, intent, session, callback);
};

function getAccountLinkName (event) {
	var appName = "";
	var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
    amznProfileURL += event.session.user.accessToken;
    request(amznProfileURL, function(error, response, body) {
        if (response.statusCode == 200) {
             var profile = JSON.parse(body);
             console.log('printing profile' + profile);
             appName = profile.name.split(" ")[0];
             console.log("LogosHelper >>>> :Hello, " + profile.name.split(" ")[0]);
                
         } else {
                console.log("LogosHelper >>>> : I can't connect to Amazon Profile Service right now, try again later");
                appName = 'NO_ID';
                
         }
     });
     
}

function displayUnknownContext(accountid, session, callback ) {
    console.log(' LogosHelper.displayUnknownContext >>>>>>'+accountid);
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = session.attributes;
    
    var cardTitle = 'LogosHealth App';

    var speechOutput = 'Not sure I understand your intent, please say help to hear options!';

    var repromptText = 'What can I help you with?';
    var shouldEndSession = false;
    
    callback(sessionAttributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function buildSpeechResponse(title, output, repromptText, shouldEndSession) {
  	console.log(' LogosHelper.buildSpeechResponse >>>>>>');
  	return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `${title}`,
            content: `${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function processIntent(event, context, intentRequest, session, callback) {
 
    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;
    
    var sessionAttributes = session.attributes; 
    var accountId = sessionAttributes.applicationAccId;
 
    // dispatch custom intents to handlers here
    if (intentName == 'NameIntent') {
    	var name = "";
    	if (intent.slots) {
    		name = intent.slots.Name.value;
    	}
    
    	console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+name);
        dbUtil.verifyUserProfile(name, accountId, session, callback);
    } 
     else if (intentName == 'OpenLogosHealthProfile') {
        handleOpenLogosHealthProfile(event, context,intent, session, callback);
    }    
    else if (intentName == 'CreateLogosHealthProfile') {   
    	var userName = sessionAttributes.userFirstName;
	    handleCreateLogosHealthProfile(event, context, userName, session, callback);    
    } 
    else if (intentName == 'AMAZON.HelpIntent') {        
	    //helpRequest(intent, session, callback);    
    }    
    else if (intentName == 'AMAZON.CancelIntent')  {        
	    //quitRequest(intent, session, callback);  
    }
    else {
        //throw "Invalid intent";
        processUserInteraction(event, intent, session, callback);
    }
}

function getWelcomeResponse(accountid, session, callback ) {
    console.log(' LogosHelper.getWelcomeResponse >>>>>>'+accountid);
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {
    		'currentProcessor':'0',
    		'applicationAccId':accountid
    };
    
	session.attributes = sessionAttributes;
    
    var cardTitle = 'LogosHealth App';

    var speechOutput = 'Welcome to Logos Health personal health records.  Please say your first Name?';

    var repromptText = 'Please provide your first name';
    var shouldEndSession = false;
    
    callback(sessionAttributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function processUserNameInput(userName, hasProfile, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processUserNameInput >>>>>>');
    
    //set session attributes
    var sessionAttributes = session.attributes;
    var accountId = sessionAttributes.applicationAccId;
    
    sessionAttributes = {
    		'currentProcessor':'1',
    		'applicationAccId':accountId,
    		'userFirstName': userName,
    		'userHasProfile':hasProfile
    };
    
    
    var cardTitle = 'User Profile';
    
    var speechOutput = "";
    
    if (hasProfile) {
    	speechOutput = "How can I help you today "+userName;
    } else {
    	speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    }

    var repromptText = 'Say Create Profile';
    var shouldEndSession = false;
    
    callback(sessionAttributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function handleSessionEndRequest(callback) {
    var cardTitle = 'Session Ended';
    var speechOutput = 'Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function processUserInteraction (event, intent, session, callback) {
    //TODO: Implementation
    console.log(' LogosHelper.processUserInteraction >>>>>>');
    //set session attributes
    var sessionAttributes = session.attributes;
    sessionAttributes.currentProcessor = '6';
    
    var cardTitle = 'Open Profile';

    var speechOutput = '';

    var repromptText = 'Interaction';
    var shouldEndSession = false;
    
    //TODO: Implement Create Profile DB logic here
    
    callback(sessionAttributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleNameIntent(event, context, name, session, callback) {

    //set session attributes
    var sessionAttributes = session.attributes;
    sessionAttributes.currentProcessor = '1';
    
    console.log(" The session attribute to handleNameIntent >>>>> "+sessionAttributes);
    
    var cardTitle = 'User Name';

    var speechOutput = 'Hello ' + name + ', How are you today?", " How can I help you today?';

    var repromptText = 'Avaialable Options';
    var shouldEndSession = false;
    
    callback(sessionAttributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleCreateLogosHealthProfile (event, context, userName, session, callback) {
    //TODO: Implementation
    console.log(' LogosHelper.handleCreateLogosHealthProfile >>>>>>');
    //set session attributes
    var sessionAttributes = session.attributes;
    sessionAttributes.currentProcessor = '4';
    
    var cardTitle = 'Create Profile';

    var speechOutput = userName+' , your create profile request has been initiated", "Please answer following questions';

    var repromptText = 'Creating a profile';
    var shouldEndSession = false;
    
    //TODO: Implement Create Profile DB logic here
    //dbUtil.createHealthProfile(passparams);
    
    callback(sessionAttributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleOpenLogosHealthProfile (event, context, intent, session, callback) {
    console.log(' LogosHelper.handleOpenLogosHealthProfile >>>>>>');
    
    var sessionAttributes = session.attributes;
    sessionAttributes.currentProcessor = '3';
    
    console.log(" The session attribute to handleOpenLogosHealthProfile >>>>> "+sessionAttributes);
    var cardTitle = 'Open Profile';

    var speechOutput = 'Hello Marty, How are you today?", "Welcome to Logos Health App';

    var repromptText = 'Opening a profile';
    var shouldEndSession = false;
    
    var accounts = ""; //dbUtil.getAllUserAccounts();
    
    console.log(" The Accounts retrieved from Database >>>>"+accounts);

    callback(sessionAttributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

