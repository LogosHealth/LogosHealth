/**
 * LogosHealth Application Utils. 
 * All global re-usable/utility functions listed here. Class could be expanded to cover my utils
 * JSON parsing is main 
 * Copyright Logos Health, Inc
 * 
 */

var aws = require('aws-sdk');
var request = require('request');

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