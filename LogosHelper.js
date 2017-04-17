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
exports.processNameIntent = function processNameIntent(userName, profileId, hasProfile, profileComplete, session, callback) {
	console.log(' LogosHelper.processNameIntent >>>>>>');
    processNameIntentResponse(userName, profileId, hasProfile, profileComplete, session, callback);
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
  	processWelcomeResponse(accountid, session, callback);
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

exports.processQnAResponse = function processQnAResponse(slotValue, qnaObj, session, callback) {
  	console.log(' LogosHelper.processQnAResponse >>>>>>');
  	executeCreateProfileQNA(slotValue, qnaObj, session, callback);
};

exports.processErrResponse= function processErrResponse(errorText, processor, session, callback) {
  	console.log(' LogosHelper.processErrResponse >>>>>>');
  	processErrorResponse(errorText, processor, session, callback) ;
};



function getLinkedAccountEmail(event, request, session, accountId, callback) {
    console.log(" Getting Account Linked Email ");
	
	var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
    amznProfileURL += event.session.user.accessToken;
    
    request(amznProfileURL, function(error, response, body) {
 	    var respBody = "";
 	    if (!error && response.statusCode == 200) {
    	    respBody = JSON.parse(body);
    	    console.log('Email from Amazon: ' + respBody.email);
	    } else {
	    	console.log('Email read Error: ' + error);
	    }
	    dbUtil.getAccountIdFromEmail(respBody.email, session, callback);
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
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
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
    var accountId = sessionAttributes.userAccId;
    
    var slotValue = "";
    if (intentName === 'LaunchIntent') {
    	//Process Generic values if selected from existing
    	slotValue = intent.slots.Answer.value;
    	console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
    	processUserGenericInteraction(event, intent, session, callback);
    }
    else if (intentName == 'NameIntent') {
    	slotValue = intent.slots.Name.value;
    	console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
        dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
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
    else if (intentName == 'AMAZON.YesIntent')  {   
    	console.log(' AMAZON.YesIntent: Intent  called >>>>>>  '+intentName);
    	session.attributes.currentProcessor = 2;
        processAnswerIntent(event, slotValue, accountId, session, callback); 
    }
    else if (intentName == 'AMAZON.NoIntent')  {   
    	console.log(' AMAZON.NoIntent: Intent  called >>>>>>  '+intentName);
        //user choose to say NO, send him to the main menu
        processor = 5;
        processUserGenericInteraction(event, intent, session, callback);   //Temp generic response, in fact user to be shown main menu
        
    }
    else if (intentName == 'AnswerIntent')  {        
	    slotValue = intent.slots.Answer.value;
    	console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
        processAnswerIntent(event, slotValue, accountId, session, callback); 
    }
    else {
        //could be user saying something out of a custom intent, process based on Current processor
        //processUserGenericInteraction(event, intent, session, callback);
    }
}

function processWelcomeResponse(accountid, session, callback ) {
    console.log(' LogosHelper.processWelcomeResponse >>>>>>'+accountid);
    // If we wanted to initialize the session to have some attributes we could add those here.
    
    var sessionAttributes = {
    		'currentProcessor':1,
    		'userAccId':accountid,
    		'userProfileId':'',
    		'logosName':'',
    		'userHasProfile':false,
    		'profileComplete': false,
    		'qnaObjArr':''
    };
    
	session.attributes = sessionAttributes;
    
    var cardTitle = 'LogosHealth App';

    var speechOutput = 'Welcome to Logos Health personal health records.  Please say your first Name?';

    var repromptText = 'Please provide your first name';
    var shouldEndSession = false;
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function processNameIntentResponse(userName, profileId, hasProfile, profileComplete, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processUserNameInput >>>>>>');
    
    var qnaObj = [];
    var processor = 0;
    var cardTitle = 'User Profile';
    var speechOutput = "";
    var accountId = session.attributes.userAccId;
    
    if (hasProfile) {
    	var speechOutput = 'Hello '+userName+ '. "," Here is main menu. Please choose one of following options. ';
    	speechOutput = speechOutput+ ' 1. Diet. '+
					' 2. Exercise. '+
					' 3. Medicine. '+
					' 4. Vitamins and Supplements. '+
					' 5. Medical Condition or Event. '+
					' 6. Medical Test. '+
					' 7. Family Member Profile. '+
					' 8. Medical News and Information relevant to you.  '+
					' 9. Medical Contacts.  '+
					' 10. Take a Medical Interview. ';
    		processor = 5;
    } else {
    	speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	processor = 2;
    }
    
    //set session attributes
    var sessionAttributes = {
    		'currentProcessor':processor,
    		'userAccId':accountId,
    		'userProfileId':profileId,
    		'logosName':userName,
    		'userHasProfile':hasProfile,
    		'profileComplete': profileComplete,
    		'qnaObjArr':qnaObj
    };
    
    processMenuResponse(speechOutput, session, callback);

}

function processAnswerIntent(event, slotValue, accountId, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processAnswerIntent >>>>>>');
    var qnaObj = [];
    //set session attributes
    var sessionAttributes = session.attributes;
    var currentProcessor = sessionAttributes.currentProcessor;
    console.log(' LogosHelper:processAnswerIntent >>>>>>'+currentProcessor);
    
    switch(currentProcessor) {
    case 1:
        dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
        break;
    case 2:
       //Create Profile QnA
        var scriptName = "Create a New Primary Profile";
        dbUtil.readQuestsionsForBranch(scriptName, slotValue, session, callback);
        break;
    case 3:
       //Continue profile QnA until completes
        qnaObj = sessionAttributes.qnaObjArr;
        executeCreateProfileQNA(slotValue, qnaObj, session, callback);
        break;
    case 4:
       	processUserGenericInteraction (session, callback);
        break;
    default:
        processUserGenericInteraction (session, callback);
	}

}

function getSortedQNAObject(QnAObjArr, sortKey) {
	 console.log(' LogosHelper:getSortedQNAObject >>>>>>');
	 
	 /*
	 QnAObjArr = [
    	{
        	"question_seq": 2,
        	"Question": "What is your age in number?",
        	"Answer": "",
        	"processed": false
    	}, {
        	"question_seq": 3,
        	"Question": "Are you employed?",
        	"Answer": "",
        	"processed": false
    	}, {
        	"question_seq": 1,
        	"Question": "What is your Gender?",
        	"Answer": "",
        	"processed": false
    	}
	];
	
	*/
	
	//sort in ascending order
	QnAObjArr.sort(function(a, b) {
    	return parseInt(a.questionId) - parseInt(b.questionId);
	});
	
	return QnAObjArr;
}

function handleSessionEndRequest(callback) {
    var cardTitle = 'Session Ended';
    var speechOutput = 'Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function processUserGenericInteraction (session, callback) {
    //TODO: Implementation
    console.log(' LogosHelper.processUserInteraction >>>>>>');
    //set session attributes
    var sessionAttributes = session.attributes;
    sessionAttributes.currentProcessor = '6';
    
    var cardTitle = 'Open Profile';

    var speechOutput = 'Sorry, Couldnt get your response. Please say help to hear menu options';

    var repromptText = 'Unknown context';
    var shouldEndSession = false;
    session.attributes = sessionAttributes;
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function executeCreateProfileQNA(slotValue, qnaObj, session, callback) {
    console.log(' LogosHelper.executeCreateProfileQNA >>>>>> '+slotValue);
    
    var qnObj = qnaObj; //getSortedQNAObject(qnaObj,"asc");
    
    var speechOutput = 'Thank you for your profile information. Saving profile.';
    //set session attributes
    var accountId = session.attributes.userAccId;
    var userName = session.attributes.logosName;
    var profileId = session.attributes.userProfileId;
    var hasProfile = session.attributes.userHasProfile;
    var hasProfileComplete = session.attributes.profileComplete
    var processor = 3;
    var isComplete = true;
    
    for (var obj in qnObj) {
    	var tempObj = qnObj[obj];
    	if (!tempObj.processed && tempObj.answerTable) {
    		console.log(' LogosHelper.executeCreateProfileQNA Found question: skipping to response >>>>>> '+tempObj.question);
    		processResponse(qnObj, session, callback);
    		break;
    	} else if (tempObj.answer == '' && tempObj.answerTable) {
    		if (tempObj.isDictionary !== null && tempObj.isDictionary.toLowerCase() == 'y') {
    			console.log(' LogosHelper.executeCreateProfileQNA : Field is Dictionary type, get ID >>>>>> '+tempObj.isDictionary);
    			dbUtil.readDictoinaryId(tempObj, qnObj, obj, slotValue, processor, session, callback);
    			isComplete = false;
    			break;
    		} else if (tempObj.formatId !== null) {
    			console.log(' LogosHelper.executeCreateProfileQNA : Field has format ID to format user input >>>>>> '+tempObj.formatId);
    			//validate user input against RegEx formatter, if error throw response otherwise continue
    			dbUtil.validateData(tempObj, qnObj, obj, slotValue, processor, session, callback);
    			isComplete = false;
    			break;
    		} else {
    			tempObj.answer = slotValue;
    			qnObj[obj].answer = slotValue;
    			//make DB call here every time  -- 
    			isComplete = false;
    			console.log(' LogosHelper.executeCreateProfileQNA Found Q answered: skipping to DB for insertion >>>>>> '+tempObj.answer);
    			dbUtil.updateProfileDetails(tempObj, qnObj, obj, session, callback);
    			break;
    		}
    	} 
    }
    
    if (isComplete) {
    	//Profile Create QnA is completed, save this to database  - not required
    	console.log(' LogosHelper.executeCreateProfileQNA: Profile execution completed, send them to Main menu ');
    	//implement response for further menu options
    	processResponse(qnObj, session, callback);
    	//processNameIntentResponse(userName, profileId, true, true, session, callback);
    } 
}

function processResponse(qnObj, session, callback) {
	console.log('LogosHelper.processResponse : CALLED>>> ');
	
    var sessionAttributes = session.attributes;
    var userName = sessionAttributes.logosName;
    
    for (var obj in qnObj) {
    	var tempObj = qnObj[obj];
    	if (!tempObj.processed) {
    		var quest = tempObj.question;
    		
    		//replace [name] tag based on User profile exists or not
    		if (quest.indexOf("[name]") != -1 && sessionAttributes.userHasProfile) {
    			console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name '+userName);
    			quest = quest.replace("[name]", userName);
    		} else {
    			console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name YOUR ');
    			quest = quest.replace("[names]", "your");
    		}
    		
    		//replace [names] tag based on User profile exists or not
    		if (quest.indexOf("[names]") != -1 && sessionAttributes.userHasProfile) {
    			console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name '+userName+'s');
    			quest = quest.replace("[names]", userName+'s');
    		} else {
    			console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name YOURS ');
    			quest = quest.replace("[names]", "yours");
    		}
    		
    		console.log('LogosHelper.processResponse : Question is >>>>>>: '+quest);
    		speechOutput = quest;
    		qnObj[obj].processed = true;
    		break;
    	}
    }
    
    var cardTitle = 'Profile QNA';

    var repromptText = 'Say Save Profile';
    var shouldEndSession = false;
    session.attributes.currentProcessor = 3;
    session.attributes.qnaObjArr = qnObj;
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processErrorResponse(errorText, processor, session, callback) {
	console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'User Input Error';

    var repromptText = 'Please provide a valid response';
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = errorText;
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processMenuResponse(speechOutput, session, callback) {
	console.log('LogosHelper.processMenuResponse : CALLED>>> ');
	
    var cardTitle = 'Main Menu';

    var repromptText = 'Main Menu Options';
  
    var shouldEndSession = false;
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
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
    
    session.attributes = sessionAttributes;
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
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
    session.attributes = sessionAttributes;

    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}



