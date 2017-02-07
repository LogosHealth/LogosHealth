/**
    Copyright LogosHealth.com, Inc. or its affiliates. All Rights Reserved.
*/

/**
 * An interactive Alexa Voice call interpretor LogosHealth
 *
 */

/**
 * App ID for the LogosHealth skill
 */
var APP_ID;


/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('AlexaSkill');
var AWS = require('aws-sdk');

var appCallback;

/**
 * comments
 *
 * @see 
 */
var Logos = function (callback) {
    appCallback = callback;
    console.log(" App context set >>>>>> : "+appCallback);
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Logos.prototype = Object.create(AlexaSkill.prototype);
Logos.prototype.constructor = Logos;

Logos.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Logos.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    //handleLogosOpenRequest(response);
    checkProfileExistsByName(response);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Logos.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Logos.prototype.intentHandlers = {
    "OpenLogosHealthProfile": function (intent, session, response) {
        handleLogosOpenRequest(response);
    },
    
    "CreateLogosHealthProfile": function (intent, session, response) {
        handleLogosProfileRequest(response);
    },

    "AMAZON.YesIntent": function (intent, session, response) {
        response.ask("User picked Yes, process continues", "What can I help you with?");
    },
    
    "AMAZON.NoIntent": function (intent, session, response) {
        response.ask("User picked No option, close process?", "GoodBye");
    },
    
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can choose existing options or choose to read health text?", "What can I help you with?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

/**
 * Initializes App with welcome message.
 */
function handleLogosOpenRequest(response) {
    // Send standard welcome message
    // Create speech output
    var speechOutput = "Welcome to Logos Health personal health records.  Who am I speaking with today?";
    var cardTitle = "Welcome message";
    response.tellWithCard(speechOutput, cardTitle, speechOutput);
}

/**
 * Checks caller name against database for profile verification, if not exists propose to create one
 */
function checkProfileExistsByName(response) {
    //Check Database with profile name, if exists repond with greeting else propose a creation
    
    var lambda = new AWS.Lambda();
    var payLoad = "";
    
    lambda.listFunctions({}, function(err, data) {
        if (err) {
            context.fail(err);
        }
        //appContext.succeed(data); //List all functions under caller account
    });
    
  
    
    lambda.invoke({
        FunctionName: 'arn:aws:lambda:us-east-1:682625020594:function:LogosHealthApp',
        InvocationType:'event',
        Payload: JSON.stringify(this._event, null, 2) // pass params
            }, function(error, data) {
            if (error) {
                payLoad = 'error', error;
            }
            if(data.Payload){
                payLoad = data.Payload;
            }
    });
    
   //appCallback(null,"PayLoad is >>>>> "+payLoad);
    
    // Send standard welcome message
    // Create speech output
    var speechOutput = "Profile found with Name ";
    var cardTitle = "Profile Verification";
    response.tell(speechOutput);
}

/**
 * Creates a new profile for Logos Health
 */
function handleLogosProfileRequest(response) {
    // Verify if profile has existence in database, if yes voice out inability to create one more otherwise initlize process to create one
    var speechOutput = "New profile creating. Please provide member name";
    var cardTitle = "Profile creation";
    response.tellWithCard(speechOutput, cardTitle, speechOutput);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context, callback) {
    // Create an instance of the LogosHealth skill.
    var logos = new Logos(callback);
    logos.execute(event, context);
};
