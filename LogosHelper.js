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
  	//console.log(' LogosHelper.checkClassAccess >>>>>>'+accountid);
  	processWelcomeResponse(accountid, session, callback);
};

exports.callRestart = function callRestart(accountid, speechOutput, session, callback) {
  	console.log(' LogosHelper.checkClassAccess >>>>>>'+accountid);
  	processRestart(accountid, speechOutput, session, callback);
};

exports.displayUnknownIntent = function displayUnknownIntent(accountid, session, callback) {
  	//console.log(' LogosHelper.displayUnknownIntent >>>>>>'+accountid);
  	displayUnknownContext(accountid, session, callback);
};

exports.createProfile = function createProfile(event, context, intent, session, callback) {
  	//console.log(' LogosHelper.createProfile >>>>>>');
  	handleCreateLogosHealthProfile(event, context, intent, session, callback);
};

exports.openProfile = function openProfile(event, context, intent, session, callback) {
  	//console.log(' LogosHelper.openProfile >>>>>>');
  	handleOpenLogosHealthProfile(event, context, intent, session, callback);
};

exports.processUserReponse = function processUserReponse(event, context, intent, session, callback) {
  	//console.log(' LogosHelper.processUserReponse >>>>>>');
  	processIntent(event, context, intent, session, callback);
};

exports.processQnAResponse = function processQnAResponse(qnaObj, session, callback, retUser) {
  	//console.log(' LogosHelper.processQnAResponse >>>>>>'+retUser);
  	processResponse(qnaObj, session, callback, retUser);
};

exports.processQnAEvent = function processQnAEvent(qnaObj, session, callback, retUser) {
  	//console.log(' LogosHelper.processQnAResponse >>>>>>'+retUser);
  	processEventResponse(qnaObj, session, callback, retUser);
};

exports.processErrResponse= function processErrResponse(errorText, processor, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	processErrorResponse(errorText, processor, session, callback);
};

exports.gotoMainMenu= function gotoMainMenu(speechOutput, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	 processMenuResponse(speechOutput, session, callback);
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
    var accountId = sessionAttributes.accountid;
    var userName = sessionAttributes.logosname;
    var retUser = sessionAttributes.retUser;
    
    var slotValue = "";
    console.log('ProcessIntent: Intent  called >>>>>>  '+intentName+ ' CurrentProcessor: '+ session.attributes.currentProcessor);

	//6-14-2017 Workaround to call proper menu options as Alexa is not recognizing menu options
	if (session.attributes.currentProcessor == 5 && intentName == 'AnswerIntent'){
		if(intent.slots.Answer.value.toLowerCase() =='menu'){
			intentName = 'MainMenuIntent';
		} else if(intent.slots.Answer.value.toLowerCase() =='feedback'|| intent.slots.Answer.value.toLowerCase() =='provide feedback'){
			intentName = 'ProvideFeedback';			
		}
	}
		
	//MM 6-24-17 If coming from or going to main menu, reset conditional session variable to default values	
	if (session.attributes.currentProcessor == 5 || intentName == 'MainMenuIntent'){
		session.attributes.scriptComplete = false;
		sessionAttributes.onBehalfOf = false;
		sessionAttributes.subjectLogosName = '';
		sessionAttributes.subjectProfileId = 0;
		sessionAttributes.minScriptId = 0;
		sessionAttributes.maxScriptId = 0;
		sessionAttributes.tableId = 0;
		sessionAttributes.currentTable = '';		
		sessionAttributes.stgScriptId = 0;
		sessionAttributes.medicaleventid = 0;
	}
	
	//MM 6-10-2017 Redirects to AnswerIntent if currentProcessor is set to Q&A branch(3)	
	if (session.attributes.currentProcessor == 3){
    	//console.log('Reset to AnswerIntent');
		if (intentName == 'AddDate') {
	    	console.log('Check the date value: '+intent.slots.Date.value);
		}
		if (intentName == 'AMAZON.YesIntent'){
			slotValue = 'Y';	
		} else if (intentName == 'AMAZON.NoIntent') {
			slotValue = 'N';	
		} 
		intentName = 'AnswerIntent';
	}
	
    if (intentName === 'LaunchIntent') {
    	//Process Generic values if selected from existing
    	slotValue = intent.slots.Answer.value;
    	//console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
    	processUserGenericInteraction(event, intent, session, callback);
    }
    else if (intentName == 'DietMenu') {
		strHelp = 'It is easy to track what you eat in LogosHealth.  Simply say I ate chicken for dinner from the main menu.  You can also specify a family member like, Bonnie had bacon and eggs for breakfast, or say, we, to apply to the whole family.  Feel free to try it now.';
		//console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
    	processHelpResponse(strHelp, 5, session, callback);
    } 	
    else if (intentName == 'NameIntent') {
    	slotValue = intent.slots.Name.value;
    	//console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
        dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
    } 
    else if (intentName == 'OpenLogosHealthProfile') {
        handleOpenLogosHealthProfile(event, context,intent, session, callback);
    }    
    else if (intentName == 'CreateLogosHealthProfile') {   
    	var userName = sessionAttributes.userFirstName;
	    handleCreateLogosHealthProfile(event, context, userName, session, callback);    
    } 
    else if (intentName == 'AddFamilyMember') {   
      //MM 6-20-17 Add family member
		var scriptName = '';
		
		if(sessionAttributes.isPrimaryProfile){
			scriptName = "Add a Family Member Profile - User is Primary";	
		} else {
			scriptName = "Add a Family Member Profile - User is Not Primary";	
		}
		
      	//MM 6-22-17 Sets the flag to capture that the user is adding data for a family member - not for himself/herself
		sessionAttributes.onBehalfOf = true;
		
		//MM 6-24-17 Add to check if user exists
		
        dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
    } 
    else if (intentName == 'CreateAllergyHistory') {   
      //MM 6-6-17 Enter an allergy
	  //MM 6-24-17 Added functionality to process the menu for entering on behalf of a family member	
    	//console.log(' processIntent: CreateAllergyHistory called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
        var scriptName = "Enter an allergy";

		if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
	    	console.log(' processIntent: CreateAllergyHistory  called >>>>>> for name: '+intent.slots.Name.value);		
			slotValue = intent.slots.Name.value;
			sessionAttributes.onBehalfOf = true;
			dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
		} else {
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		}
    } 
    else if (intentName == 'EnterVaccine') {   
      //MM 6-13-17 Enter an vaccine
	  //MM 6-24-17 Added functionality to process the menu for entering on behalf of a family member	
    	//console.log(' processIntent: EnterVaccine  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
        var scriptName = "Enter a Vaccine History Record";
		
		if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
	    	console.log(' processIntent: EnterVaccine  called >>>>>> for name: '+intent.slots.Name.value);		
			slotValue = intent.slots.Name.value;
			sessionAttributes.onBehalfOf = true;
			dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
		} else {
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		}		
    } 
    else if (intentName == 'AddMedicalEvent') {   
	  //MM 6-24-17 Added functionality to process the menu for entering on behalf of a family member	
    	//console.log(' processIntent: AddMedicalEvent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
        var scriptName = "Add Medical Event";
		
		if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
	    	console.log(' processIntent: AddMedicalEvent  called >>>>>> for name: '+intent.slots.Name.value);		
			slotValue = intent.slots.Name.value;
			sessionAttributes.onBehalfOf = true;
			dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
		} else {
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		}		
    } 	
    else if (intentName == 'AddMedicine') {   
	  //MM 6-26-17 Added functionality to add medicine	
    	//console.log(' processIntent: AddMedicine  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
        var scriptName = "Add Medication";
		
		if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
	    	console.log(' processIntent: AddMedicine  called >>>>>> for name: '+intent.slots.Name.value);		
			slotValue = intent.slots.Name.value;
			sessionAttributes.onBehalfOf = true;
			dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
		} else {
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		}		
    } 	
    else if (intentName == 'AddVitamin') {   
	  //MM 6-26-17 Added functionality to add vitamin	
    	//console.log(' processIntent: AddVitamin  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
        var scriptName = "Add Vitamin";
		
		if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
	    	console.log(' processIntent: AddVitamin  called >>>>>> for name: '+intent.slots.Name.value);		
			slotValue = intent.slots.Name.value;
			sessionAttributes.onBehalfOf = true;
			dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
		} else {
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		}		
    } 	
    else if (intentName == 'AddExercise') {   
	  //MM 6-26-17 Added functionality to add vitamin	
    	//console.log(' processIntent: AddVitamin  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
        var scriptName = "Add Exercise";
		
		if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
	    	console.log(' processIntent: AddExercise  called >>>>>> for name: '+intent.slots.Name.value);		
			slotValue = intent.slots.Name.value;
			sessionAttributes.onBehalfOf = true;
			dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
		} else {
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		}		
    } 	
	else if (intentName == 'ProvideFeedback') {   
      //MM 6-13-17 Provide Feedback
    	//console.log(' processIntent: ProvideFeedback  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
        var scriptName = "Provide Feedback";
        dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
    } 
	else if (intentName == 'AMAZON.HelpIntent') {        
	    //helpRequest(intent, session, callback);    
    }    
    else if (intentName == 'AMAZON.CancelIntent')  {        
	    //quitRequest(intent, session, callback);  
    }
    else if (intentName == 'AMAZON.YesIntent')  {   
    	//console.log(' AMAZON.YesIntent: Intent  parameter check >>>>>>  '+retUser);
    	slotValue = "yes";
    	processAnswerIntent(event, slotValue, accountId, session, callback); 
    }
    else if (intentName == 'AMAZON.NoIntent')  {   
    	//console.log(' AMAZON.NoIntent: Intent  called >>>>>>  '+intentName);
    	slotValue = "no";
        //user choose to say NO, send him to the main menu for Demo
        processNameIntentResponse(sessionAttributes.logosname, sessionAttributes.profileid, true, false, session, callback);
    }
	//MM 6-13-2017 Added MainMenu Intent 
	else if (intentName == 'MainMenuIntent') {
		if(!sessionAttributes.retUser){
			processNameIntentResponse(sessionAttributes.logosname, sessionAttributes.profileid, true, true, session, callback);		
		} else{
	    	console.log(' AMAZON.MainMenuIntent: retUser: '+retUser);		
		}
			
	    //helpRequest(intent, session, callback);    
    }    
	//MM 6-11-2017 Added bypass in case yes or no intent was answered which leaves Answer undefined 
    else if (intentName == 'AnswerIntent')  {        
		if (slotValue == ""){
			slotValue = intent.slots.Answer.value;		
		}
    	console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
        processAnswerIntent(event, slotValue, accountId, session, callback); 
    }
	//MM 6-26-2017 Added date intent to try and better handle date inputs 
	else if (intentName == 'AnswerDate')  {        
		if (slotValue == ""){
			slotValue = intent.slots.Date.value;		
		}
    	console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
        processAnswerIntent(event, slotValue, accountId, session, callback); 
    }
	//MM 6-26-2017 Added AddDiet intent handler 
	else if (intentName == 'AddDiet')  {        
    	console.log(' processIntent: AddDiet, Name = '+intent.slots.Name.value+' food = '+intent.slots.Food.value+' meal = '+intent.slots.Meal.value);
		dbUtil.addDietRecord(intent, session, callback);
    }
	//MM 6-27-2017 Added CompleteInterview intent handler 
	else if (intentName == 'CompleteInterview')  {        
    	console.log(' processIntent: CompleteInterview. ');
		dbUtil.getInProgressInStaging(sessionAttributes.profileid, session, callback);
		//processAnswerIntent(event, slotValue, accountId, session, callback); 
    }
    else {
		var errorText = "This is not a valid menu option.  Please try again.";
		processErrorResponse(errorText, 5, session, callback);
        //could be user saying something out of a custom intent, process based on Current processor
        //processUserGenericInteraction(event, intent, session, callback);
    }
}

function processWelcomeResponse(accountid, session, callback ) {
    console.log(' LogosHelper.processWelcomeResponse >>>>>>'+accountid);
    // If we wanted to initialize the session to have some attributes we could add those here.

	//MM 6-10-17 added additional variables to align with processNameIntentResponse variables for use to control various downstream processes
	var maxScriptID = 0;
	var minScriptID = 0;
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var subjectLogosName = '';
	var stgScriptId = 0;
	var scriptName = '';
	var dateofmeasure = new Date();
	
	
	var qnObj = '';
    var sessionAttributes = {
    		'currentProcessor':1,
    		'accountid':accountid,
    		'profileid':0,
    		'logosname':'',
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'onBehalfOf':onBehalfOf,
			'medicaleventid':0,
    		'isPrimaryProfile':false,
    		'primaryAccHolder':'',
    		'primaryProfileId':0,
    		'userHasProfile':false,
    		'profileComplete': false,
			'minScriptId' :minScriptID,
			'maxScriptId' :maxScriptID,
			'scriptComplete':scriptComplete,
			'tableId' :tableId,
			'currentTable' :curTable,			
			'stgScriptId' :stgScriptId,
			'scriptName' :scriptName,
			'stagingContinueText': '', 
			'dateofmeasure' :dateofmeasure,
    		'qnaObj':qnObj
    };
    
	session.attributes = sessionAttributes;
    
    var cardTitle = 'LogosHealth App';

    var speechOutput = 'Welcome to Logos Health personal healthcare companion.  Please say your first Name.';

    var repromptText = 'Please provide your first name';
    var shouldEndSession = false;
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function processRestart(accountid, speechOutput, session, callback) {
    console.log(' LogosHelper.processRestart >>>>>>'+accountid);
    // If we wanted to initialize the session to have some attributes we could add those here.

	//MM 6-10-17 added additional variables to align with processNameIntentResponse variables for use to control various downstream processes
	var maxScriptID = 0;
	var minScriptID = 0;
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var subjectLogosName = '';
	var stgScriptId = 0;
	var scriptName = '';
	var dateofmeasure = new Date();
	
	
	var qnObj = '';
    var sessionAttributes = {
    		'currentProcessor':1,
    		'accountid':accountid,
    		'profileid':0,
    		'logosname':'',
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'onBehalfOf':onBehalfOf,
			'medicaleventid':0,
    		'isPrimaryProfile':false,
    		'primaryAccHolder':'',
    		'primaryProfileId':0,
    		'userHasProfile':false,
    		'profileComplete': false,
			'minScriptId' :minScriptID,
			'maxScriptId' :maxScriptID,
			'scriptComplete':scriptComplete,
			'tableId' :tableId,
			'currentTable' :curTable,			
			'stgScriptId' :stgScriptId,
			'scriptName' :scriptName,
			'stagingContinueText': '', 
			'dateofmeasure' :dateofmeasure,
    		'qnaObj':qnObj
    };
    
	session.attributes = sessionAttributes;
    
    var cardTitle = 'LogosHealth App';

    var repromptText = 'Please provide your first name';
    var shouldEndSession = false;
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function processNameIntentResponse(userName, profileId, hasProfile, profileComplete, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processUserNameInput >>>>>>');
    
	//MM 6-10-17 added the following persistence variable: maxScriptID, scriptComplete, tableId, stgScriptId, scriptName
    var qnObj = {};
    var processor = 0;
    var cardTitle = 'User Profile';
    var speechOutput = "";
	var maxScriptID = 0;
	var minScriptID = 0;
	var subjectLogosName = '';
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var stgScriptId = 0;
	var scriptName = '';
	var dateofmeasure = new Date();
    var accountId = session.attributes.accountid;
    var isPrimary = session.attributes.isPrimaryProfile == null?false:session.attributes.isPrimaryProfile;
    var primAccName = session.attributes.primaryAccHolder == null?false:session.attributes.primaryAccHolder;
    var primAccId = session.attributes.primaryProfileId == null?false:session.attributes.primaryProfileId;
    
    if (profileComplete) {
    	var speechOutput = 'Hello '+userName+ '. "," Welcome to the Logos Health Prototype main menu. Please choose one of the following options. ';
    	speechOutput = speechOutput+ ' Diet. '+
					' Exercise. '+
					' Medicine. '+
					' Vitamins and Supplements. '+
					' Medical Event. '+
					' Allergy. '+
					' Vaccine. '+
					' Add Family Member.  '+
					' Complete In-Progress Interview.  '+
					' Provide Feedback.  ';
    		processor = 5;
    } else {
    	speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	processor = 2;
    }
    
    //set session attributes
    var sessionAttributes = {
    		'currentProcessor':processor,
    		'accountid':accountId,
    		'profileid':profileId,
    		'logosname':userName,
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'onBehalfOf':onBehalfOf,
			'medicaleventid':0,
    		'isPrimaryProfile':isPrimary,
    		'primaryAccHolder':primAccName,
    		'primaryProfileId':primAccId,
    		'userHasProfile':hasProfile,
    		'profileComplete': profileComplete,
			'minScriptId' :minScriptID,
			'maxScriptId' :maxScriptID,
			'scriptComplete':scriptComplete,
			'tableId' :tableId,
			'currentTable' :curTable,
			'stgScriptId' :stgScriptId,
			'scriptName' :scriptName,
			'dateofmeasure' :dateofmeasure,
    		'qnaObj':qnObj
    };
    
    session.attributes = sessionAttributes;
    
    processMenuResponse(speechOutput, session, callback);

}

function processAnswerIntent(event, slotValue, accountId, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processAnswerIntent >>>>>>');
    var qnaObj = {};
    //set session attributes
    var sessionAttributes = session.attributes;
    var currentProcessor = sessionAttributes.currentProcessor;
    var isPrimary = sessionAttributes.isPrimaryProfile;
    
    console.log(' LogosHelper:processAnswerIntent >>>>>>'+currentProcessor+' and is primary profile ?  '+isPrimary);
    
    switch(currentProcessor) {
    case 1:
	    //console.log(' LogosHelper:Get Name thread - SlotValue >>>>>> ' + slotValue);
		session.attributes.logosname = slotValue;	
        dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
        break;
    case 2:
       //Create Profile QnA
        var scriptName = "Create a New Primary Profile";
        if(!isPrimary) {
        	scriptName = "Create a New Profile - Not primary - User adding own record";
        }
        dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
        break;
    case 3:
       //Continue profile QnA until completes
        qnaObj = sessionAttributes.qnaObj;
        saveResponseQNA(slotValue, qnaObj, session, callback);
        break;
    case 4:
       	processUserGenericInteraction (session, callback);
        break;
    case 5:
		var errorText = "This is not a valid menu option.  Please try again.";
		processErrorResponse(errorText, 5, session, callback);	
        break;
    default:
        processUserGenericInteraction (session, callback);
	}

}

function handleSessionEndRequest(callback) {
    var cardTitle = 'Session Ended';
    var speechOutput = 'Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function processMainMenuOptions(session, callback) {
	//TODO: Implement main menu options here
	
	
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

function saveResponseQNA(slotValue, qnaObj, session, callback) {
    console.log(' LogosHelper.saveResponseQNA >>>>>> Slot value is '+slotValue);
    
    var speechOutput = 'Thank you for your response. Saving.';
    //set session attributes
    var accountId = session.attributes.accountid;
    var userName = session.attributes.logosname;
    var profileId = session.attributes.profileid;
    var hasProfile = session.attributes.userHasProfile;
    var hasProfileComplete = session.attributes.profileComplete
    var sessionAttributes = session.attributes;
	var processor = 3;
    var isComplete = true;
    var retUser = session.attributes.retUser;
    var isScriptComplete; 
    
	//MM 06-07-17 Removed the not hasProfileComplete check - need to replace with isScriptComplete
	//Changed the name to saveResponseQNA to be more accurate in description

    console.log(' LogosHelper.saveResponseQNA : eventQNArr >>>>>> '+ qnaObj.eventQNArr==null);
	
	//MM 6-22-17 Adding the check to update session variables 
	if (qnaObj.answerField !==null) {
		if (sessionAttributes.onBehalfOf && qnaObj.answerField.indexOf("logosname") != -1) {
			sessionAttributes.subjectLogosName = slotValue;
		}
	}
	
	if (qnaObj.processed && isEmpty(qnaObj.eventQNArr)) {
    	session.attributes.qnaObj.answerFieldValue = slotValue;
    	session.attributes.qnaObj.answer = slotValue;
    	
    	if (qnaObj.isDictionary !== null && qnaObj.isDictionary.toLowerCase() == 'y') {
    		console.log(' LogosHelper.saveResponseQNA : Field is Dictionary type, get ID >>>>>> '+qnaObj.isDictionary);
    		dbUtil.readDictoinaryId(qnaObj, slotValue, processor, false, session, callback);
    	} else if (qnaObj.formatId && qnaObj.formatId !== null) {
			console.log(' LogosHelper.saveResponseQNA : Field has format ID to format user input >>>>>> '+qnaObj.formatId);
			//validate user input against RegEx formatter, if error throw response otherwise continue
			dbUtil.validateData(qnaObj, slotValue, processor, session, callback);
		} else {
			if (qnaObj.formatId == 3) {
				console.log(" LogosHelper.saveResponseQNA >>>>: Received Date input as "+slotValue);
				var dtStr = slotValue.split(' ').join('-');
				console.log(" LogosHelper.saveResponseQNA >>>>: date reconstructed as  "+dtStr);
				qnaObj.answer = dtStr;
				dbUtil.saveResponse(qnaObj, session, callback);
			} else {
				qnaObj.answer = slotValue;
				dbUtil.saveResponse(qnaObj, session, callback);
			}
			
		}
    } else if (!isEmpty(qnaObj.eventQNArr)){
		var eventQNArr = qnaObj.eventQNArr;
		var quest = "";
    	//console.log(' LogosHelper.saveResponseQNA >>>>>> Event script processing qnaObj.eventQNArr: ', qnaObj.eventQNArr);
    	console.log(' LogosHelper.saveResponseQNA >>>>>> Event script processing eventQNAArr: ', eventQNArr);

		eventQNArr.answer = slotValue;
		
		if (eventQNArr.isDictionary !== null  && eventQNArr.isDictionary.toLowerCase() == 'y') {
			console.log(' LogosHelper.processEventSpecificResponse : Field is Dictionary type, get ID >>>>>> '+eventQNArr.isDictionary);
			dbUtil.readDictoinaryId(qnaObj, eventQNArr.answer, processor, true, session, callback);
		} else if (eventQNArr.formatId !== null && eventQNArr.formatId != "") {
			console.log(' LogosHelper.processEventSpecificResponse : Field is Dictionary type, get ID >>>>>> '+eventQNArr.formatId);
			dbUtil.validateData(qnaObj, eventQNArr.answer, processor, session, callback);
		} else {
			console.log(' LogosHelper.processEventSpecificResponse : Call Update Event Details >>>>>> '+eventQNArr.answer);
			dbUtil.updateEventDetails(qnaObj, eventQNArr, eventQNArr.answer, session, callback);
		}
    } else {
    	processResponse(qnaObj, session, callback, retUser);
    }
}

function processResponse(qnObj, session, callback, retUser) {
	console.log('LogosHelper.processResponse : CALLED>>> ');
	
    var sessionAttributes = session.attributes;
    var userName = sessionAttributes.logosname;
    var primaryName = sessionAttributes.primaryAccHolder;
    var quest = '';
    var isProcessed = qnObj.processed;
    var isComplete = true;
    var slotValue = "";	
	
  if (sessionAttributes.stagingContinueText !== '' && sessionAttributes.stagingContinueText !== undefined) {
  	quest = sessionAttributes.stagingContinueText;
	sessionAttributes.stagingContinueText = '';
  }
 	
  if (qnObj.question !== undefined) {
    quest = quest + qnObj.question;	  
  } else {
  	quest = qnObj.question;	
  }
	  
  if (quest !== undefined) {
	//MM 6-22-17 Changes the tag based on whether the user is entering data for himself/herself or on behalf of a family member
	//replace [name] tag based on User profile exists or not
	if (quest.indexOf("[name]") != -1 && sessionAttributes.onBehalfOf) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name '+sessionAttributes.subjectLogosName);
		quest = quest.replace("[name]", sessionAttributes.subjectLogosName);
	} else {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name YOUR ');
		quest = quest.replace("[name]", "you");
	}

	//replace [names] tag based on User profile exists or not
	if (quest.indexOf("[names]") != -1 && sessionAttributes.onBehalfOf) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name '+sessionAttributes.subjectLogosName+'s');
		quest = quest.replace("[names]", sessionAttributes.subjectLogosName+"'s");
	} else {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name YOURS ');
		quest = quest.replace("[names]", "your");
	}
	
	if (quest.indexOf("[primary]") != -1 && !sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [primary] tag, replacing with logos name '+primaryName);
		quest = quest.replace("[primary]", primaryName);
	} else if (quest.indexOf("[primary]") != -1 && sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [primary] tag, replacing with YOU');
		quest = quest.replace("[primary]", "you");		
	}

	if (quest.indexOf("[primarys]") != -1 && !sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [primarys] tag, replacing with logos name '+primaryName);
		quest = quest.replace("[primarys]", primaryName + "'s");
	} else if (quest.indexOf("[primarys]") != -1 && sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [primarys] tag, replacing with YOUR');
		quest = quest.replace("[primarys]", "your");				
	}
  } else {
  	quest = "There is an error retrieving the question.  If this persists, please contact customer service.  Restarting logoshealth.  Please say your first name."
	processRestart(sessionAttributes.accountid, quest, session, callback);  
  }
	
	var speechOutput = "";

	if (session.attributes.retUser) {
		speechOutput = 'Hello '+userName+'. Welcome back to Logos Health!. Your profile is incomplete!. Say Yes to continue, No to redirect to main menu. ", " Note. Until your profile completes, your menu options are limited!.';
		qnObj.processed = false;
		session.attributes.retUser = false;
	} else {
		speechOutput = quest;
		qnObj.processed = true;
	}

	var cardTitle = 'Profile QnA';

	var repromptText = 'Say Save Profile';
	var shouldEndSession = false;
	
	if (!session.attributes.scriptComplete){
		session.attributes.currentProcessor = 3;		
	}
	
	session.attributes.qnaObj = qnObj;
	console.log(' LogosHelper.processResponse >>>>>>: output text is '+speechOutput);
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processEventResponse(qnObj, session, callback, retUser) {
	console.log('LogosHelper.processEventResponse : CALLED>>> ');
	
    var sessionAttributes = session.attributes;
    var userName = sessionAttributes.logosname;
    var primaryName = sessionAttributes.primaryAccHolder;
    var quest = '';
	var isProcessed = qnObj.processed;
    var isComplete = true;
    var slotValue = "";
 
	if (sessionAttributes.stagingContinueText !== '' && sessionAttributes.stagingContinueText !== undefined) {
		quest = sessionAttributes.stagingContinueText;
		sessionAttributes.stagingContinueText = '';
	}

	if (qnObj.eventQNArr.eventQuestion !== undefined) {
    quest = quest + qnObj.eventQNArr.eventQuestion;	  
  } else {
  	quest = qnObj.eventQNArr.eventQuestion;	
  }

	//MM 6-24-17 Copied logic from processResponse - changed tags to clarify
	if (quest.indexOf("[name]") != -1 && sessionAttributes.onBehalfOf) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [name] tag, replacing with logos name '+sessionAttributes.subjectLogosName);
		quest = quest.replace("[name]", sessionAttributes.subjectLogosName);
	} else {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [name] tag, replacing with logos name YOUR ');
		quest = quest.replace("[name]", "you");
	}

	//replace [names] tag based on User profile exists or not
	if (quest.indexOf("[names]") != -1 && sessionAttributes.onBehalfOf) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [name] tag, replacing with logos name '+sessionAttributes.subjectLogosName+'s');
		quest = quest.replace("[names]", sessionAttributes.subjectLogosName+"'s");
	} else {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [name] tag, replacing with logos name YOURS ');
		quest = quest.replace("[names]", "your");
	}
	
	if (quest.indexOf("[primary]") != -1 && !sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [primary] tag, replacing with logos name '+primaryName);
		quest = quest.replace("[primary]", primaryName);
	} else if (quest.indexOf("[primary]") != -1 && sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [primary] tag, replacing with YOU');
		quest = quest.replace("[primary]", "you");		
	}

	if (quest.indexOf("[primarys]") != -1 && !sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [primarys] tag, replacing with logos name '+primaryName);
		quest = quest.replace("[primarys]", primaryName + "'s");
	} else if (quest.indexOf("[primarys]") != -1 && sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [primarys] tag, replacing with YOUR');
		quest = quest.replace("[primarys]", "your");				
	}

	var speechOutput = "";

	if (session.attributes.retUser) {
		speechOutput = 'Hello '+userName+'. Welcome back to Logos Health!. Your profile is incomplete!. Say Yes to continue, No to redirect to main menu. ", " Note. Until your profile completes, your menu options are limited!.';
		qnObj.processed = false;
		session.attributes.retUser = false;
	} else {
		speechOutput = quest;
		qnObj.processed = true;
	}

	var cardTitle = 'Profile QnA';

	var repromptText = 'Say Save Profile';
	var shouldEndSession = false;

	if (!session.attributes.scriptComplete){
		session.attributes.currentProcessor = 3;		
	}

	
	console.log(' LogosHelper.processEventResponse >>>>>>: output text is '+speechOutput);
	//session.attributes.qnaObj.eventQNArr.eventQuestion = quest;
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processEventSpecificResponse(qnObj, session, callback) {
	console.log(' LogosHelper.processEventSpecificResponse >>>>>>: output text is '+quest);
	var speechOutput = quest;

	var cardTitle = 'Event Questions';

	var repromptText = 'Say Save Event Data';
	var shouldEndSession = false;
	session.attributes.currentProcessor = 3;
	session.attributes.qnaObj = qnObj;
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	
}

function processErrorResponse(errorText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'User Input Error';

    var repromptText = 'Please provide a valid response';
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = errorText;
	
	console.log('LogosHelper.processErrorResponse>: output text is '+speechOutput);
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processHelpResponse(helpText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'Help Text';

    var repromptText = 'Helpful information for you';
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = helpText;
	
	console.log('LogosHelper.processHelpResponse>: output text is '+speechOutput);
  
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

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

