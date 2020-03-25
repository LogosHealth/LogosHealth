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
var moment = require('moment-timezone');

/**
 * Create a new build response.
 * @param {object} [values]Session Attributes to use in add in response object
 * @param {object} Speech output
 * 
 * @public
 */
exports.buildResponse = function buildResponse(sessionAttributes, speechletResponse) {
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
exports.processNameIntent = function processNameIntent(userName, profileId, hasProfile, profileComplete, profileObj, session, callback) {
	console.log(' LogosHelper.processNameIntent >>>>>>');
    processNameIntentResponse(userName, profileId, hasProfile, profileComplete, profileObj, session, callback);
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
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.displayWelcomeMsg = function displayWelcomeMsg(accountid, accountEmail, session, callback) {
  	processWelcomeResponse(accountid, accountEmail, session, callback);
};

//******** */MM 12-12-18 May consider replacing this with gotoMainMenu for error handling responses***********************
exports.callRestart = function callRestart(accountid, speechOutput, session, callback) {
  	processRestart(accountid, speechOutput, session, callback);
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

exports.helpResponse= function helpResponse(helpText, processor, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	processHelpResponse(helpText, processor, session, callback);
};

exports.confirmResponse= function confirmResponse(confirmText, processor, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	processConfirmResponse(confirmText, processor, session, callback);
};

exports.gotoMainMenu= function gotoMainMenu(speechOutput, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	 processMenuResponse(speechOutput, session, callback);
};

exports.constructOrderMealResponse= function constructOrderMealResponse(action, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	 constructOrderMealResp(action, session, callback);
};

/*  MM - 2/26/2018   Branch Definitions - for currentProcessor.  These represent the context from which the application expects the next answer to come from (i.e. which menu) 
	 currentProcessor = 1 - Create a new primary profile, confirm Name at intro
	 currentProcessor = 2 - Yes-No concerning if the new user wants to create a profile
	 currentProcessor = 3 - Answer - within a current interview
	 currentProcessor = 4 - Create a new profile
	 currentProcessor = 5 - Main menu
	 currentProcessor = 6 - Name handling (up front - when Alexa hears a new name not currently in the family)
	 currentProcessor = 7 - Overwrite food preferences
	 currentProcessor = 8 - Overwrite diet preferences
	 currentProcessor = 9 - Order a Meal
	 currentProcessor = 10 - Confirm Sleep Time Entry (AM/PM)
	 currentProcessor = 11 - Confirm Exit from within Interview
	 currentProcessor = 12 - Confirm return to Main Menu from within Interview
	 currentProcessor = 13 - See if user wants to update address to use Order a Meal feature
*/

/*  MM - 12/12/2018 This is the initial response handler for LogosHealth.  It takes the intent information (i.e. the user response) and compares
it to what is expected - the branch (currentProcessor value).  Based off this information, this function may perform preprocessing of data, continue
the Q&A of an existing interview, start a new menu item (whether interview or instant menu item), or respond to a directive (like skip, exit, etc.)
*/

function processIntent(event, context, intentRequest, session, callback) {
    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;    
    var sessionAttributes = session.attributes; 
    var accountId = sessionAttributes.accountid;
	var expected = false;
	var isDateValue = false;
	var slotValue = "";
	var blnIgnoreIntent = false;
	
    console.log('ProcessIntent Start: Intent  called >>>>>>  '+intentName+ ' CurrentProcessor: '+ session.attributes.currentProcessor);
	console.log('ProcessIntent: Intent slots >>>>>>  ', intent.slots);	
	console.log('ProcessIntent: session >>>>>>  ', session);	
	console.log('ProcessIntent: SessionAttributes >>>>>>  ', sessionAttributes);
    console.log('ProcessIntent: SessionAttributes QnA>>>>>>  ', sessionAttributes.qnaObj);
    console.log('ProcessIntent: SessionAttributes QnA Event>>>>>>  ', sessionAttributes.qnaObj.eventQNArr);

	//5-9-2018 MM Reset variable everytime
	sessionAttributes['answerID'] = '';	

	//As many dictionary terms have been entered into the Alexa Skill front end with specific ids, this code will extract said id which corresponds to the 
	//dictionaryid within the dictionary table
	//5-9-2018 MM Added to check for Dictionary ID from Alexa front end answer
	if (intent.slots !== undefined) {
		if (intent.slots.Answer !== undefined) {
			console.log('Has Answer: ' + intent.slots.Answer.value);		
			if (intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values !== undefined) {
				console.log('Has Dictionary ID from intent: ' + intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id);
				//5-9-2018 MM Ensures the ID from Alexa is a number - meaning we set it and it will align with a Dictionary ID; default Alexa IDs which are not manually updated
				//are hashmaps
				//(/^\d+(\.\d+)?/.exec(intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id))
				//x!=x (intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id !=intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id) 
				if (intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id.length < 17) {
					sessionAttributes['answerID'] = intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id;
					console.log('isNaN is true - answerID set'); 
				} else {
					console.log('isNaN is false - answerID  not set'); 				
				}
			} else {
				console.log('No Dictionary ID for Answer');
			}
		}
	}

	//Translation section - Accounting for skills which are handled out of branch based off of Alexa's recognition patterns
	//6-14-2017 Workaround to call proper menu options as Alexa is not recognizing menu options
	if (session.attributes.currentProcessor == 5 && intentName == 'AnswerIntent'){
		if(intent.slots.Answer.value.toLowerCase() =='menu'){
			intentName = 'MainMenuIntent';
			console.log('LogosHelper.processIntent - Intent adjusted to MainMenuIntent');
		} else if (intent.slots.Answer.value.toLowerCase() =='feedback'|| intent.slots.Answer.value.toLowerCase() =='provide feedback'){
			intentName = 'ProvideFeedback';			
			console.log('LogosHelper.processIntent - Intent adjusted to ProvideFeedback');
		} else if (intent.slots.Answer.value.toLowerCase() =='nutrition') {
			intentName = 'DietMenu';			
			console.log('LogosHelper.processIntent - Intent adjusted to DietMenu');
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

	//MM 01-08-19 Added repeat handling within main menu(s) including categories and options	
	if (session.attributes.currentProcessor == 5 && intentName == 'Repeat'){
		expected = true;			
		blnIgnoreIntent = true;
		processRepeatRequest(sessionAttributes.lastMessage, session, callback);	
	}

	//MM 6-10-2017 Redirects to AnswerIntent if currentProcessor is set to Q&A branch(3)
	//MM 7-26-2017 Added new handlers for better handing things like male/female, spelling
	//************ THIS IS THE SECTION WHERE ALL Q&A ANSWER PRE-PROCESSING OCCURS INCLUDING Yes/No, Skip, Stop, Repeat, Cancel, Main Menu, Exit***********/
	if (session.attributes.currentProcessor == 3){
		if (intentName == 'AnswerIntent') {
			expected = true;			
		} else if (intentName == 'AMAZON.YesIntent'){
    	//console.log('Reset to AnswerIntent');
			slotValue = 'Y';
			expected = true;
			if (session.attributes.retUser) {
				session.attributes.retUser = false;
			}
		} else if (intentName == 'AMAZON.NoIntent') {
			slotValue = 'N';	
			expected = true;
		} else if (intentName == 'NameIntent') {
			slotValue = intent.slots.Name.value;
			expected = true;
	    	console.log('FirstNameIntent loop Q&A: '+slotValue);
		} else if (intentName == 'SpellingIntent') {
	    	console.log('SpellingIntent loop Q&A: ', intent.slots);
			slotValue = spellWord(intent);
			expected = true;
		} else if (intentName == 'Skip') {
			//MM 9-4-2018 Added Skip functionality
			expected = true;
			blnIgnoreIntent = true;			
			dbUtil.skipAnswer(intent, session, callback);
		} else if (intentName == 'Repeat') {
			//MM 9-4-2018 Added Repeat functionality
			expected = true;
			blnIgnoreIntent = true;			
			//var helpText = session.attributes.qnaObj.question;
			processResponse(session.attributes.qnaObj, session, callback, false);
		} else if (intentName == 'AMAZON.StopIntent') {
			expected = true;			
			blnIgnoreIntent = true;
			var confirmText = 'You can finish incomplete interviews by choosing, complete interview, from the main menu.  Are you sure you want to exit Logos Health?';
			processConfirmResponse(confirmText, 11, session, callback);  //currentProcessor = 11 - Confirm Exit from within Interview 
		} else if (intentName == 'MainMenuIntent') {
			expected = true;			
			blnIgnoreIntent = true;
			var confirmText = 'You can finish incomplete interviews by choosing, complete interview, from the main menu.  Are you sure you want to return to the main menu?';
			processConfirmResponse(confirmText, 12, session, callback);  //currentProcessor = 12 - Confirm return to Main Menu from within Interview 
		} else {
			console.log('***************ALERT - Branch is Q&A answer -3, but intent is unexpected: ' + intentName + '**********************************');
		}

		//MM 5-8-18 - Added EnterDate 
		//MM 5-9-18 - Added Filter Criteria for when expecting a date value within an interview 
		if ((sessionAttributes.qnaObj.answerType == 'date' && isEmpty(sessionAttributes.qnaObj.eventQNArr)) 
			|| (!isEmpty(sessionAttributes.qnaObj.eventQNArr) && sessionAttributes.qnaObj.eventQNArr.answerType == 'date')) {
				console.log('Date FilterQuery Working!!!');
				if (intentName == 'EnterDate') {
					slotValue = intent.slots.Date.value;
					isDateValue = true;
					if (slotValue == undefined) {
						slotValue = '--';
					}
					if (slotValue.length == 7) {
						slotValue = slotValue + '-00';
					}
					expected = true;			
				} else {
					console.log('Add for trying to handle free text date fields');					
					slotValue = '--';
					isDateValue = true;
					expected = true;			
				}		
		}		
		//Specifically forcing intentName to AnswerIntent based on branch = 3 -- Alternate flows managed above
		intentName = 'AnswerIntent';
	} // if (session.attributes.currentProcessor == 3) - ongoing Q&A branch

	//MM 7-22-2017 Added new handlers for better handing first names using AMAZON.first_name
	if (session.attributes.currentProcessor == 1){	
		if (intentName == 'NameIntent') {
			slotValue = intent.slots.Name.value;
			console.log('NameIntent loop getName: '+slotValue);
			intentName = 'AnswerIntent';	
		} else if (intentName == 'SpellingIntent') {
			slotValue = spellWord(intent);
			console.log('SpellingIntent loop Q&A for ' + slotValue + 'from Spelling: ', intent.slots);
			intentName = 'AnswerIntent';	
		} else {
			console.log("Error - Expecting Name but Recieved intentName: " + intentName);
		} 
	}	
	
	//HERE STARTS THE SECTION WHERE PROCESSING IS DONE BASED ON THE BRANCH AND THE BLNSKIPINTENT IS MARKED AS TRUE TO BYPASS THE SUBSEQUENT MENU PROCESSING SECTION BELOW
	//AND AVOID UNINTENDED CONSEQUENCES OF MULTITHREAD CODE SPLITTING AND EXECUTION

	//MM 12-12-18 Handler for confirming exit app from within interview
	if (session.attributes.currentProcessor == 11){	
		if (intentName == 'AMAZON.YesIntent') {
			blnIgnoreIntent = true;
			console.log('User confirmed - Exiting LogosHealth from within interview');
			var errorText = 'Good bye.  Have a great day!';
			processExitResponse(errorText, 11, session, callback);		
		}	else {
			blnIgnoreIntent = true;
			var qnObj = sessionAttributes.qnaObj;
			qnObj.question = 'Resuming, ' + qnObj.question;
			processResponse(qnObj, session, callback, false);		
		}
	}	

	//MM 12-12-18 Handler for confirming returning to main menu from within interview
	if (session.attributes.currentProcessor == 12){	
		if (intentName == 'AMAZON.YesIntent') {
			blnIgnoreIntent = true;
			console.log('User confirmed - Returning to main menu');
			var speechOutput = 'Main menu.  For a list of options, simply say menu';
			processMenuResponse(speechOutput, session, callback);
		} else {
			blnIgnoreIntent = true;
			var qnObj = sessionAttributes.qnaObj;
			qnObj.question = 'Resuming, ' + qnObj.question;
			processResponse(qnObj, session, callback, false);		
		}
	}	

	//MM 7-19-2018 Added new handlers for confirm Sleep Timing
	if (session.attributes.currentProcessor == 10){	
		console.log("From confirm Sleep timing - intent name = " + intentName);
		if  (intentName == 'AMAZON.YesIntent') {
			session.attributes.confirmTime.confirmed = true;
			blnIgnoreIntent = true;
			dbUtil.instantSleepSummaryDirect(session.attributes.confirmTime.profileid, session.attributes.confirmTime.strFor, true, intent, session, callback);
		} else if (intentName == 'AMAZON.NoIntent') {
			var confirmText = 'Please repeat and state explicitly the sleep times using AM and PM.  For example, I slept from 11PM to 5AM.';
			blnIgnoreIntent = true;
			processConfirmResponse(confirmText, 10, session, callback); 
		} else if (intentName == 'InstantSleepSummary') {
			if (intent.slots !==undefined) {
				if (intent.slots.SleepStart !== undefined) {
					if (intent.slots.SleepStart.value !== undefined) {
						var sleepStart = intent.slots.SleepStart.value;
						console.log('SleepStart has value: ' + sleepStart);
						var sleepSplit = sleepStart.split(":");
						var sleepHour = Number(sleepSplit[0]);
						var sleepMinute = sleepSplit[1];
						if (sleepHour == 0) {
							var sleepTimeFinalCheck = "12:" + sleepMinute + " AM"; 
						} else if (sleepHour < 12) {
							var sleepTimeFinalCheck = sleepHour + ":" + sleepMinute + " AM"; 
						} else if (sleepHour == 12) {
							var sleepTimeFinalCheck = "12:" + sleepMinute + " PM"; 
						} else {
							var sleepTimeFinalCheck = (Number(sleepHour) - 12) + ":" + sleepMinute + " PM"; 
						}
					}
				} else {
					console.log('Sleep is undefined');
				}
				if (intent.slots.WakeTime !== undefined) {
					if (intent.slots.WakeTime.value !== undefined) {
						var wakeTime = intent.slots.WakeTime.value;
						console.log('WakeTime has value: ' + wakeTime);
						var wakeSplit = wakeTime.split(":");
						var wakeHour = Number(wakeSplit[0]);
						var wakeMinute = wakeSplit[1];
						if (wakeHour == 0) {
							var wakeTimeFinalCheck = "12:" + wakeMinute + " AM"; 
						} else if (wakeHour < 12) {
							var wakeTimeFinalCheck = wakeHour + ":" + wakeMinute + " AM"; 
						} else if (wakeHour == 12) {
							var wakeTimeFinalCheck = "12:" + wakeMinute + " PM"; 
						} else {
							var wakeTimeFinalCheck = (Number(wakeHour) - 12) + ":" + wakeMinute + " PM"; 
						}
					}
				} 	
				if (sleepStart !== undefined || (wakeTime !== undefined && sleepStart !== undefined)) {
					var confirmTime = {
						"sleepTimeFinal": sleepStart,
						"sleepTimeFinalCheck":sleepTimeFinalCheck,
						"wakeTimeFinal": wakeTime,
						"wakeTimeFinalCheck": wakeTimeFinalCheck,
						"profileid": session.attributes.confirmTime.profileid,
						"strFor": session.attributes.confirmTime.strFor,
						"confirmed": true
					}
					session.attributes.confirmTime = confirmTime;
					blnIgnoreIntent = true;
					dbUtil.instantSleepSummaryDirect(session.attributes.confirmTime.profileid, session.attributes.confirmTime.strFor, true, intent, session, callback);				
				} else {
					var strMenu = 'This is not a valid sleep entry.  Main menu.  For a list of menu options, simply say, Menu.';
					session.attributes.currentProcessor = 5;
					blnIgnoreIntent = true;
					processMenuResponse(strMenu, session, callback);	
				}
			} else {
				var strMenu = 'This is not a valid sleep entry.  Main menu.  For a list of menu options, simply say, Menu.';
				session.attributes.currentProcessor = 5;
				blnIgnoreIntent = true;
				processMenuResponse(strMenu, session, callback);
			}
		} else {
			var strMenu = 'This is not a valid response for confirming sleep time.  Main menu.  For a list of menu options, simply say, Menu.';
			session.attributes.currentProcessor = 5;
			blnIgnoreIntent = true;
    		processMenuResponse(strMenu, session, callback);
		}
	} //session.attributes.currentProcessor == 10
	
	//MM 2-28-2018 Added new handlers for Order a Meal
	if (session.attributes.currentProcessor == 9){	
		console.log('In Order Meal intent 9: IntentName is ' + intentName);
	  if (intentName == 'FindMeal') {
		blnIgnoreIntent = true;
		constructOrderMealResp('order', session, callback);				
	  } else if (intent.slots !== undefined) {
		if (intent.slots.Answer !== undefined) {
			slotValue = intent.slots.Answer.value;
			console.log("Slot value from Order Meal Branch: " + slotValue);
			if (slotValue == 'next' && session.attributes.currentMenuIndex == 9) {
				console.log("Need to get next batch of 10");
				//need to update to requery and get next batch - placeholder below
				blnIgnoreIntent = true;
				session.attributes.miNotSelected.push(session.attributes.menuItems[session.attributes.currentMenuIndex].menuitemid);
				dbUtil.getNextMeals(session, callback);
			} else if (slotValue == 'next' ) {
				//need to add code to add currentmenuitem into the "not in array"
				blnIgnoreIntent = true;
				session.attributes.miNotSelected.push(session.attributes.menuItems[session.attributes.currentMenuIndex].menuitemid);
				constructOrderMealResp(slotValue, session, callback);				
			} else {
				blnIgnoreIntent = true;
				constructOrderMealResp(slotValue, session, callback);								
			}
		} else if (intentName == 'DietMenu') {
			console.log('Caught it!');
			blnIgnoreIntent = true;
			constructOrderMealResp('nutrition', session, callback);  	
		} else {
			blnIgnoreIntent = true;
			constructOrderMealResp('Bad Response', session, callback);
		}
	  }	else if (intentName == 'MainMenuIntent') {
		blnIgnoreIntent = true;
		constructOrderMealResp('main menu', session, callback);  
	  } else if (intentName == 'DietMenu') {
		blnIgnoreIntent = true;
		constructOrderMealResp('nutrition', session, callback);  
	  } else {
		blnIgnoreIntent = true;
		constructOrderMealResp('Bad Response', session, callback);	  	
	  }
	} //session.attributes.currentProcessor == 9
	
	//MM 7-26-2017 Added new workflow for handling initial logosname
	if (session.attributes.currentProcessor == 6){	
		if (intentName == 'AMAZON.YesIntent') {
			blnIgnoreIntent = true;
    		console.log(' processIntent: Intent for NameConfirmation called >>>>>>  '+intentName+ ' logosname = ' +session.attributes.logosname);
        	dbUtil.verifyUserProfile(session.attributes.logosname, accountId, session, callback);
		}	else if (intentName == 'AMAZON.NoIntent') {
			blnIgnoreIntent = true;
    		console.log(' processIntent: Intent for NameConfirmation called >>>>>>  '+intentName);
			strHelp = 'Please spell your first name.  Please start with, "the word is spelled".';
    		processHelpResponse(strHelp, 6, session, callback);
		}	else if (intentName == 'SpellingIntent') {
			blnIgnoreIntent = true;
			slotValue = spellWord(intent);
    		console.log(' processIntent: Intent for NameConfirmation Spelling called >>>>>>  '+intentName+' Name is '+slotValue);
        	dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
		}	else if (intentName == 'AnswerIntent') {
			blnIgnoreIntent = true;
			slotValue = intent.slots.Answer.value;
    		console.log(' processIntent: Intent for NameConfirmation Answer called >>>>>>  '+intentName+' Name is '+slotValue);
        	dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
		}	else if (intentName == 'NameIntent') {
			blnIgnoreIntent = true;
			slotValue = intent.slots.Name.value;
    		console.log(' processIntent: Intent for NameConfirmation Name called >>>>>>  '+intentName+' Name is '+slotValue);
        	dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
		}
	}	
	
	//MM 1-7-2017 Added new workflow for overwrite of food preference profile
	if (session.attributes.currentProcessor == 7){	
		if (intentName == 'AMAZON.YesIntent') {
			blnIgnoreIntent = true;
    		console.log('User overwrite of existing food profile');
        	session.attributes.scriptName = "Set Food Preferences"
			dbUtil.foodPreferenceRedo (intent, session, callback);
		} else if (intentName == 'AMAZON.NoIntent') {
			blnIgnoreIntent = true;
    		console.log(' No overwrite of existing food profile.  Go to Main Menu');
			var strMenu = 'Main menu.  For a list of menu options, simply say, Menu.';
			session.attributes.currentProcessor = 5;
    		processMenuResponse(strMenu, session, callback);
		}  else {
			blnIgnoreIntent = true;
    		console.log(' Answer not understood.  Requery');
			strHelp = 'I did not understand your response.  Please say Yes or No.';
    		processHelpResponse(strHelp, 7, session, callback);			
		}
	}	
	
	//MM 1-7-2017 Added new workflow for overwrite of diet preference profile
	if (session.attributes.currentProcessor == 8){	
		if (intentName == 'AMAZON.YesIntent') {
			blnIgnoreIntent = true;
    		console.log('User overwrite of existing dietary profile');
        	session.attributes.scriptName = "Set Dietary Preferences"
			dbUtil.dietPreferenceRedo (intent, session, callback);
		} 	else if (intentName == 'AMAZON.NoIntent') {
			blnIgnoreIntent = true;
    		console.log(' No overwrite of existing dietary profile.  Go to Main Menu');
			var strMenu = 'Main menu.  For a list of menu options, simply say, Menu.';
			session.attributes.currentProcessor = 5;
    		processMenuResponse(strMenu, session, callback);
		}  else {
			blnIgnoreIntent = true;
    		console.log(' Answer not understood.  Requery');
			strHelp = 'I did not understand your response.  Please say Yes or No.';
    		processHelpResponse(strHelp, 8, session, callback);			
		}
	}	

	//MM 12-12-18 Refactored to call from processor value ignoring intent
	if (session.attributes.currentProcessor == 2){
		if (intentName == 'AMAZON.YesIntent'){
			slotValue = 'Y';	
		} else {
			slotValue = 'N';	
		} 
		blnIgnoreIntent = true;
		processAnswerIntent(event, slotValue, accountId, session, callback);
	}	

	if (!blnIgnoreIntent) {
		//**************** HANDLE ALEXA RESPONSE IN THE PROJECTED ORDER BY MOST TO LEAST FREQUENT/
		//SECTION 1: Q&A ANSWERS AND GENERIC TYPE HANDLERS (e.g. date value handler)
		//MM 6-11-2017 Added bypass in case yes or no intent was answered which leaves Answer undefined 
		if (intentName == 'AnswerIntent')  {        
			if (expected == false && session.attributes.currentProcessor == 3) {
				console.log(' processIntent: Unexpected Intent called during Q&A');
				var errorText = "I did not understand your answer.  Please repeat, but start with I said";
				processErrorResponse(errorText, 3, session, callback);
			} else if (isDateValue == true && isValidDate(slotValue) == false) {
				var errorText = "Please try again.  Dates must include at least month and year and should be spoken in the following manner: July 4th, 1776.  Please start with the Date is.";
				processErrorResponse(errorText, 3, session, callback);
			} else if (session.attributes.currentProcessor == 9) {
				console.log("AnswerIntent - Found the bug for retrieving next batch of meals");
			} else {		
				if (slotValue == ""){
					slotValue = intent.slots.Answer.value;
					console.log('Answer: ' + slotValue);
				}	
				console.log(' processAnswerIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
				processAnswerIntent(event, slotValue, accountId, session, callback);
			}			
		}
		//MM 6-26-2017 Added date intent to try and better handle date inputs 
		else if (intentName == 'AnswerDate')  {        
			if (slotValue == ""){
				slotValue = intent.slots.Date.value;		
			}
			console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
			processAnswerIntent(event, slotValue, accountId, session, callback); 
		}

		//SECTION 2: INSTANT MENUS
		//MM 6-26-2017 Added AddDiet intent handler 
		//MM 12-10-2018 Changed Name to Instant Meal (align naming convention) - Added Calories  
		else if (intentName == 'InstantMeal')  {        
			console.log(' processIntent: AddDiet, Name = '+intent.slots.Name.value+' food = '+intent.slots.Food.value+' meal = '+intent.slots.Meal.value+
			' calories = '+intent.slots.Calories.value);
			dbUtil.addDietRecord(intent, session, callback);
		}
		//MM 7-1-2018 Added InstantTaskExercise intent handler 
		else if (intentName == 'InstantTaskExercise')  {        
			console.log(' processIntent: InstantTaskExercise, Name = '+intent.slots.Name.value+' Num = '+intent.slots.Num.value+' Tasks = '+intent.slots.Tasks.value+' Duration = '+
			  intent.slots.Duration.value);
			dbUtil.instantTaskExercise(intent, session, callback);
		}
		//MM 7-17-2018 Added InstantSleepSummary intent handler 
		else if (intentName == 'InstantSleepSummary')  {        
			var sleepValueId = intent.slots.SleepTime;
			if (sleepValueId  !== undefined) {
				sleepValueId = intent.slots.SleepTime.resolutions;
			}
			if (sleepValueId  !== undefined) {
				sleepValueId = intent.slots.SleepTime.resolutions.resolutionsPerAuthority[0].values;
			}
			if (sleepValueId  !== undefined) {
				sleepValueId = intent.slots.SleepTime.resolutions.resolutionsPerAuthority[0].values[0].value.id;
				console.log('InstantSleepSummary - sleepValueId) Identification: ' +  sleepValueId);				
				session.attributes.sleepValueId = sleepValueId;				
			} else {
				session.attributes.sleepValueId = "";									
			}
			console.log(' processIntent: InstantSleepSummary, Name = '+intent.slots.Name.value);
			dbUtil.instantSleepSummary(intent, session, callback);
		}
		//MM 7-17-2018 Added InstantSleepSleep intent handler 
		else if (intentName == 'InstantSleepSleep')  {        
			console.log(' processIntent: InstantSleepSleep, Name = '+intent.slots.Name.value);
			dbUtil.instantSleepSleep(intent, session, callback);
		}
		//MM 7-17-2018 Added InstantSleepWake intent handler 
		else if (intentName == 'InstantSleepWake')  {        
			console.log(' processIntent: InstantSleepWake, Name = '+intent.slots.Name.value);
			dbUtil.instantSleepWake(intent, session, callback);
		}
		//MM 01-06-2018 Added InstantWeight intent handler 
		else if (intentName == 'InstantWeight')  {        
			console.log(' processIntent: InstantWeight, Action= '+intent.slots.Weight.value+' Name = '+intent.slots.Name.value);
			dbUtil.addWeightRecord(intent, session, callback);
		}
		//MM 10-23-2018 Added InstantSymptom intent handler 
		else if (intentName == 'InstantSymptom')  {        
			console.log(' processIntent: InstantSymptom, Symptom = '+intent.slots.Symptom.value);
			dbUtil.instantSymptom(intent, session, callback);
		}		
		//MM 7-26-2018 Added Instant Blood Glucose intent handler 
		else if (intentName == 'InstantBloodGlucose')  {        
			console.log(' processIntent: InstantBloodGlucose, Name = '+intent.slots.Name.value + ', Result = ' + intent.slots.Result.value);
			dbUtil.instantBloodGlucose(intent, session, callback);
		}	
		//MM 7-24-2018 Added InstantMood intent handler 
		else if (intentName == 'InstantMood')  {        
			console.log(' processIntent: InstantMood, Mood = '+intent.slots.Mood.value);
			dbUtil.instantMood(intent, session, callback);
		}
		//MM 10-19-2018 Added InstantTemperature intent handler 
		else if (intentName == 'InstantTemperature')  {        
			console.log(' processIntent: InstantTemperature, Temperature = '+intent.slots.Temperature.value);
			dbUtil.instantTemperature(intent, session, callback);
		}
		//MM 1-8-2017 Added MainMenu Intent Handler 
		else if (intentName == 'MainMenuIntent')  {        
			//********************REVIEW CODE */
			console.log(' processIntent: MainMenuIntent. ');
			processNameIntentResponseFull(session.attributes.logosname, session.attributes.profileid, true, true, session, callback);
		} 		

		//SECTION 3: MENU CATEGORY OPTIONS AND HELP
		//MM 01-08-19 Added  
		else if (intentName == 'MenuOptionDailyHealth')  {        
			console.log('Daily Health Menu Option Called');
			processMenuCategory(intentName, session, callback);
		}
		//MM 01-08-19 Added  
		else if (intentName == 'MenuOptionMedicalRecords')  {        
			console.log('Medical Records Menu Option Called');
			processMenuCategory(intentName, session, callback);
		}
		//MM 01-08-19 Added  
		else if (intentName == 'MenuOptionSettings')  {        
			console.log('Settings Menu Option Called');
			processMenuCategory(intentName, session, callback);
		}
		else if (intentName == 'MenuOptionGeneralTopics')  {        
			console.log('General Topics Option Called');
			processMenuCategory(intentName, session, callback);
		}

		//SECTION 4: INTERVIEWS (STARTING THE Q&A)
		else if (intentName == 'NameIntent') {
			slotValue = intent.slots.Name.value;
			console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
			dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
		} 
		//MM 12-11-18 Added interview for nutrition and nutrition details
		else if (intentName == 'DietMenu') {
			var scriptName = "Add Nutrition";			
			if (intent.slots !== undefined && intent.slots.Name !== undefined && intent.slots.Name.value !== undefined 
				&& (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
				console.log(' processIntent: AddVitamin  called >>>>>> for name: '+intent.slots.Name.value);		
				slotValue = intent.slots.Name.value;
				sessionAttributes.onBehalfOf = true;
				dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
			} else {
				dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
			}		
		} 	
		else if (intentName == 'DietDetails') {
			var scriptName = "Add Nutrition Details";			
			if (intent.slots !== undefined && intent.slots.Name !== undefined && intent.slots.Name.value !== undefined 
				&& (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
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
		else if (intentName == 'FindMeal') {   
			//MM 11-21-17 Set Food Preferences
			console.log(' processIntent: FindMeal  called >>>>>>  ');		
			var scriptName = "Find a Meal";
			session.attributes.scriptName = scriptName;
			if (intent.slots !== undefined) {
				if(intent.slots.restaurant !== undefined && intent.slots.restaurant.value !== undefined) {
					console.log('Find a Meal - Restaurant: ', intent.slots.restaurant);
					session.attributes.orderRestaurant = intent.slots.restaurant.value;
					console.log('Find a Meal - Restaurant Value: ' + session.attributes.orderRestaurant);
					if (session.attributes.orderRestaurant.indexOf("\'") != -1) {
						session.attributes.orderRestaurant = session.attributes.orderRestaurant.split("\'").join("");
							console.log('LogosHelper:FindMeal has apostrophe '+session.attributes.orderRestaurant);	
					}		
					console.log('FindMeal Restaurant: ' + session.attributes.orderRestaurant);
				} else {
					session.attributes.orderRestaurant = "";	
					session.attributes.addtionalRestFilter = "";				
				} 	
				if (intent.slots.foodCatFav !== undefined && intent.slots.foodCatFav.value !== undefined) {
					var foodCatFavId = intent.slots.foodCatFav.resolutions.resolutionsPerAuthority[0].values;
					if (foodCatFavId  !== undefined) {
						foodCatFavId = intent.slots.foodCatFav.resolutions.resolutionsPerAuthority[0].values[0].value.id;
						console.log('Find a Meal - foodCatFav Identification: ' +  foodCatFavId);				
						session.attributes.orderFoodCatFavId = foodCatFavId;				
					} else {
						session.attributes.orderFoodCatFavId = "";									
					}
					console.log('Find a Meal - foodCatFav: ', intent.slots.foodCatFav);				
					session.attributes.orderFoodCatFav = intent.slots.foodCatFav.value;
				}else {
					session.attributes.orderFoodCatFav = "";
					session.attributes.orderFoodCatFavId = "";
				}	
				if (intent.slots.exactDish !== undefined && intent.slots.exactDish.value !== undefined) {
					console.log('Find a Meal - exactDish: ', intent.slots.exactDish);				
					session.attributes.orderFoodCatFav = intent.slots.exactDish.value;
				}else {
					session.attributes.orderFoodCatFav = "";
				}				
			} else {
				session.attributes.orderRestaurant = "";	
				session.attributes.addtionalRestFilter = "";				
				session.attributes.orderFoodCatFav = "";
				session.attributes.orderFoodCatFavId = "";
			}
			dbUtil.findExistingFoodPreferencesMeal(intent, session, callback);
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
		else if (intentName == 'ProvideFeedback') {   
			//MM 6-13-17 Provide Feedback
			  //console.log(' processIntent: ProvideFeedback  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			  var scriptName = "Provide Feedback";
			  dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
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
		else if (intentName == 'AddLab') {   
			//MM 7-26-18 Set Exercise Goal
			var scriptName = "Add Lab";
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
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
		//MM 6-27-2017 Added CompleteInterview intent handler 
		else if (intentName == 'CompleteInterview')  {        
			console.log(' processIntent: CompleteInterview. ');
			dbUtil.getInProgressInStaging(sessionAttributes.profileid, session, callback);
		} 
		//MM 01-01-2018 Added AddFood intent handler 
		else if (intentName == 'UpdateFoodPreferences')  {        
			console.log(' processIntent: UpdateFoodPreferences, Action= '+intent.slots.Action.value+' Category = '+intent.slots.Category.value);
			console.log(' processIntent: UpdateFoodPreferences, FoodField= '+intent.slots.FoodField.value+' FoodValue = '+intent.slots.FoodValue.value);
		//console.log(' processIntent: UpdateFoodPreferences, FoodValueID: ', intent.slots.FoodValue.resolutions.resolutionsPerAuthority[0].values);
			//console.log(' processIntent: UpdateFoodPreferences, FoodValueID: ', intent.slots.FoodValue.resolutions.resolutionsPerAuthority[0].values[0].value.id);
			dbUtil.updateFoodPreferences(intent, session, callback);
		}
		//MM 01-13-2018 Added AddDiet intent handler 
		else if (intentName == 'UpdateDietaryPreferences')  {        
			console.log(' processIntent: UpdateDietaryPreferences, Action= '+intent.slots.Action.value+' DietCategory = '+intent.slots.DietCategory.value);
			dbUtil.updateDietaryPreferences(intent, session, callback);
		}
		else if (intentName == 'SetExerciseGoal') {   
			//MM 6-26-18 Set Exercise Goal
			var scriptName = "Set Exercise Goal";
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		} 
		else if (intentName == 'SetRepeatingTaskGoal') {   
			//MM 6-26-18 Set Exercise Goal
			var scriptName = "Set Repeating Task Goal";
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		} 
		else if (intentName == 'SetFoodPreferences') {   
			//MM 11-21-17 Set Food Preferences
			  console.log(' processIntent: SetFoodPreferences  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			  var scriptName = "Set Food Preferences";
			  session.attributes.scriptName = scriptName;
			  dbUtil.findExistingFoodPreferences(intent, session, callback);
			  //dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
		  } 
		  else if (intentName == 'SetDietaryPreferences') {   
			//MM 12-29-17 Set Dietary Preferences
			  console.log(' processIntent: SetDietaryPreferences  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			  var scriptName = "Set Dietary Preferences";
			  session.attributes.scriptName = scriptName;
			  dbUtil.findExistingDietPreferences(intent, session, callback);
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
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
		} 
		else {
			var errorText = "This is not a valid menu option.  Please try again.";
			console.log('Complete fallthrough with processor: ' + session.attributes.currentProcessor + ' & intent = ', intent);
			processErrorResponse(errorText, 5, session, callback);
		}
	} else {
		console.log('Menu content ignored from up front branch code - blnIgnoreIntent is true!');
	}
}

function buildSpeechResponse(title, output, repromptText, shouldEndSession) {
	console.log(' LogosHelper.buildSpeechResponse >>>>>>' + title + ": " + shouldEndSession);
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

//************************************************************************************************/
//MM 12-12-18 THIS IS THE SECTION OF VARIOUS FLAVORS OF INITIAL SETUP OF SESSIONATTRIBUTE VARIABLES
//************************************************************************************************/

//MM 12-12-18 Though build a while ago, the initial response function only called once when app is initially loading from DBUtil.displayWelcomeMsg
function processWelcomeResponse(accountid, accountEmail, session, callback ) {
	console.log(' LogosHelper.processWelcomeResponse >>>>>>'+accountid + ', email: '+ accountEmail);
	console.log ('processWelcomeResponse session: ', session);
	var maxScriptID = 0;
	var minScriptID = 0;
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var subjectLogosName = '';
	var stgScriptId = 0;
	var scriptName = '';
	var foodCategoryId = 0;
	var dateofmeasure = new Date();	
	var qnObj = {};
    var sessionAttributes = {
    		'currentProcessor':1,
    		'accountid':accountid,
			'accountEmail': accountEmail,
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
			'continueInProgress': false,
			'dateofmeasure' :dateofmeasure,
			'foodcategoryid' :foodCategoryId,
			'OOChecked': false,
    		'qnaObj':qnObj
	};
	if (session.personid !== undefined && session.personid !== null) {
		sessionAttributes.personid = session.personid;
	}    
	session.attributes = sessionAttributes;
    console.log('LogosHelper.processWelcomeResponse Check after>>>>>>'+session.attributes.accountEmail);    
    var cardTitle = 'LogosHealth App';
    var speechOutput = 'Welcome to Logos Health personal healthcare companion.  Who am I serving today?  Please start with My Name is.';
    var repromptText = 'Please provide your first name';
    var shouldEndSession = false;    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 12-12-18 Restarts the app including seeking a new profile
function processRestart(accountid, speechOutput, session, callback) {
    console.log(' LogosHelper.processRestart >>>>>>'+accountid);
	var maxScriptID = 0;
	var minScriptID = 0;
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var subjectLogosName = '';
	var stgScriptId = 0;
	var scriptName = '';
	var foodCategoryId = 0;
	var dateofmeasure = new Date();	
	var qnObj = {};
    var sessionAttributes = {
    		'currentProcessor':1,
    		'accountid':accountid,
			'accountEmail': session.attributes.accountEmail,
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
			'continueInProgress': false,
			'dateofmeasure' :dateofmeasure,
			'foodcategoryid' :foodCategoryId,
			'OOChecked': false,
    		'qnaObj':qnObj
    };
    
	session.attributes = sessionAttributes;    
    var cardTitle = 'LogosHealth App';
    var repromptText = 'Please provide your first name';
    var shouldEndSession = false;    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 12-12-18 The Response after the user states the name upon startup - populates profile, primary profile (when applicable) and account info
//Called from dbUtil.getUserProfileByName 
//MM 01-09-19 Added profileObj to pass profile attribute data to be housed in sessionAttribute obj
function processNameIntentResponse(userName, profileId, hasProfile, profileComplete, profileObj, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processNameIntentResponse > UserName = ' + userName + ' Processor = ' + session.attributes.currentProcessor);    
	//MM 6-10-17 added the following persistence variable: maxScriptID, scriptComplete, tableId, stgScriptId, scriptName
    var qnObj = {};
    var processor = 0;
    var speechOutput = "";
	var maxScriptID = 0;
	var minScriptID = 0;
	var subjectLogosName = '';
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var stgScriptId = 0;
	var foodCategoryId = 0;
	var scriptName = '';
	var dateofmeasure = new Date();
	var timezone = session.attributes.userTimezone;
    var accountId = session.attributes.accountid;
	var accountEmail = session.attributes.accountEmail;
    var isPrimary = session.attributes.isPrimaryProfile == null?false:session.attributes.isPrimaryProfile;
    var primAccName = session.attributes.primaryAccHolder == null?false:session.attributes.primaryAccHolder;
    var primAccId = session.attributes.primaryProfileId == null?false:session.attributes.primaryProfileId;
 
    if (profileComplete) {
    	var speechOutput = 'Hello '+userName+ '. "," Welcome to Logos Health. What would you like to do? For a list of options, say menu';
    	processor = 5;
    } else if (session.attributes.currentProcessor == 1) {
		var spellName = '';
		for (var i = 0; i < userName.length; i++) {
			if (i !== userName.length-1) {
				spellName = spellName + userName.substring(i, i+1) + '-';
			} else {
				spellName = spellName + userName.substring(i, i+1);
			}
		} 
		//MM 7-26-17 Altered the flow to make sure Alexa is hearing the user's name properly
		speechOutput = 'I understood your name as '+userName+ ', ' + spellName +'.  Is that correct?';
		processor = 6;
		//speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	//processor = 2;
    } else {
		speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	processor = 2;
	}    
    //set session attributes
    var sessionAttributes = {
    		'currentProcessor':processor,
    		'accountid':accountId,
			'accountEmail' :accountEmail,
			'profileid':profileId,
			'profileObj':profileObj,
    		'logosname':userName,
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'userTimezone':timezone, 
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
			'stagingContinueText': '', 
			'continueInProgress': false,
			'scriptName' :scriptName,
			'dateofmeasure' :dateofmeasure,
			'foodcategoryid' :foodCategoryId,
			'OOChecked': false,
    		'qnaObj':qnObj
    };
    session.attributes = sessionAttributes;    
    processSelectionResponse(speechOutput, session, callback);
}

//12-12-18 This is essentially the help menu - may change
function processNameIntentResponseFull(userName, profileId, hasProfile, profileComplete, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processNameIntentResponseFull > UserName = ' + userName + ' Processor = ' + session.attributes.currentProcessor);    
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
	var foodCategoryId = 0;
	var dateofmeasure = new Date();
    var accountId = session.attributes.accountid;
	var accountEmail = session.attributes.accountEmail;
	var timezone = session.attributes.userTimezone;
	var profileObj = session.attributes.profileObj;
    var isPrimary = session.attributes.isPrimaryProfile == null?false:session.attributes.isPrimaryProfile;
    var primAccName = session.attributes.primaryAccHolder == null?false:session.attributes.primaryAccHolder;
    var primAccId = session.attributes.primaryProfileId == null?false:session.attributes.primaryProfileId;
    
    if (profileComplete) {
    	var speechOutput = 'Please choose from one of the following categories for specific menu options. ';
    	speechOutput = speechOutput+ ' Daily Health.  '+
					' Medical Records.  '+
					' Getting Started.  '+
					' General Topics.';
    		processor = 5;
    } else if (session.attributes.currentProcessor == 1) {
		//MM 7-26-17 Altered the flow to make sure Alexa is hearing the user's name properly
		speechOutput = 'I understood your name as '+userName+ '.  Is that correct?';
		processor = 6;
    } else {
		speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	processor = 2;
	}    
    //set session attributes
    var sessionAttributes = {
    		'currentProcessor':processor,
    		'accountid':accountId,
			'accountEmail' :accountEmail,
    		'profileid':profileId,
			'profileObj':profileObj,
    		'logosname':userName,
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'userTimezone':timezone, 
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
			'stagingContinueText': '', 
			'continueInProgress': false,
			'scriptName' :scriptName,
			'dateofmeasure' :dateofmeasure,
			'foodcategoryid' :foodCategoryId,
			'OOChecked': false,
    		'qnaObj':qnObj
    };
	session.attributes = sessionAttributes;
	provideMenuCategory(speechOutput, session, callback);
}

//MM 01-08-19 processes the chosen Menu Categories
function processMenuCategory(intentName, session, callback) {
	var speechOutput = "Please choose from the following menu options";
	
	if (intentName == 'MenuOptionDailyHealth') {
		speechOutput = speechOutput + ".  Nutrition.  Exercise.  Order a Meal.  Say, Help with Instant Menus, to learn more about the fastest data entry for daily health items.";
	} else if (intentName == 'MenuOptionMedicalRecords')  {        
		speechOutput = speechOutput + " to add to your electronic medical record.  Medical Event.  Allergy.  Vaccine.  Lab.  Procedure.  Historical Medication.  Full Medical Interview.";
	}
	else if (intentName == 'MenuOptionSettings')  {
		//Currently omitting Update Food Preferences.  Update Nutrition Preferences.        
		speechOutput = speechOutput + ".  Set-up Medication.  Set-up Vitamin.  Set Food Preferences.  Set Nutrition Preferences.  Set Exercise Goal.  Set Task Goal.  Add Family Member.  Complete Profile.";
	}
	else if (intentName == 'MenuOptionGeneralTopics')  {        
		speechOutput = speechOutput + ".  Provide Feedback. Update Address.  Complete In-Progress Interview.";
	}

	provideMenuOptions(speechOutput, session, callback);
}

//******************************************************************************************************/
//MM 12-12-18 THIS IS THE SECTION OF REPETATIVE HANDLERS FOR INTERVIEW Q&A ENGINE WHICH FEEDS FROM USER RESPONSE TO DATABASE
//******************************************************************************************************/

//MM 12-12-18 This function forwards execution to the proper function based on currentProcessor though usually facilitating Q&A - curProcessor = 3
//Use this function for incoming data preprocessing not related to dictionaries and intent transformation
function processAnswerIntent(event, slotValue, accountId, session, callback) {
    var qnaObj = {};
    //set session attributes
    var sessionAttributes = session.attributes;
    var currentProcessor = sessionAttributes.currentProcessor;
	var isPrimary = sessionAttributes.isPrimaryProfile;
	var blnSkip = false;

    console.log(' LogosHelper:processAnswerIntent >>>>>>'+currentProcessor+' and slotValue ?  '+slotValue);    
    switch(currentProcessor) {
	case 3:
		//Continue profile QnA until completes
		//MM 7-31-2017 Added handler for apostrophe 		
		 qnaObj = sessionAttributes.qnaObj;
		//If a user has not completed profile entry and says 'No' to question of continuing - respond and exit.
		 if (slotValue == 'N' && sessionAttributes.retUser) {
			 var errorText = "You must complete your profile to leverage Logos Health.  When you are ready, please reenter and complete profile creation.  Good bye.";
			 processExitResponse(errorText, 2, session, callback);							
		 } else {
			 //***************************SECTION FOR DATA PRE-PROCESSING **************************************/
			 //Apostrophe handling
			 if (slotValue.indexOf("'") != -1) {
				 slotValue = slotValue.split("'").join("''");
				 console.log('LogosHelper:processAnswerIntent has apostrophe '+slotValue);	
			 }

			 if (qnaObj.answerType == 'weekday') {
				var timezone = 'utc';
				console.log('processAnswerIntent - current userTimeZone is: ' + sessionAttributes.userTimezone);
				if (sessionAttributes.userTimezone !==undefined && sessionAttributes.userTimezone !==null && sessionAttributes.userTimezone !=="") {
					timezone = sessionAttributes.userTimezone;					
				} 
				//console.log('************Translate Test for today ****************** ' + translateDay2DatePast(session, 'today', sessionAttributes.userTimezone));
				var dayofmeasure = translateDay2DatePast(session, slotValue, timezone);
				if (dayofmeasure == 'error') {
					console.log('need to handle');
					blnSkip = true;
					var errorText = 'This is not a valid option.  Please say, today, yesterday or a day of the week referring to the previous week.';
					processErrorResponse(errorText, 3, session, callback); //3 is Q&A processor value
				} else {
					slotValue = dayofmeasure;
					//MM 1-11-19 dateofmeasure is set initially from the weekday entry
					sessionAttributes.dateofmeasure = dayofmeasure;
				}
			 }

			 if (qnaObj.answerType == 'time') {
				var isoTime = getIsoTime(session, slotValue);
				var processed = setTime2DateofMeasure(session, isoTime);
				if (qnaObj.answerField == 'mealtime') {
					sessionAttributes.mealtime = isoTime;
				} 
				console.log('setTime2DateofMeasure processed: ' + processed);
			 }

			 //*******************/Section for adding specific sessionAttribute values  
			 if(qnaObj.answerField == 'meal') {
				 sessionAttributes.meal = slotValue;
				 console.log('Added meal to sessionAttributes from processAnswerIntent: ' + slotValue);
			 }

			 if (!blnSkip) {
				saveResponseQNA(slotValue, qnaObj, session, callback);		
			 }
		 }	
		 break;
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
		if (slotValue == 'Y') {
	        dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		} else {
		//If a user has not entered a profile  and says 'No' to question of entering a profile - respond and exit.
		var errorText = "You must complete your profile to leverage Logos Health.  When you are ready, please reenter and complete profile creation.  Good bye.";
			processExitResponse(errorText, 2, session, callback);				
		}	
        break;
    default:
		var errorText = "This is not a valid menu option.  Please try again.";
		console.log('****FALL THROUGH TO ERROR IN ProcessAnswerIntent for ' + currentProcessor, sessionAttributes);
		processErrorResponse(errorText, 5, session, callback);	
	}
}

//MM 12-12-18 Accounts for dictionaries, formats (which aren't used) - then sends to util functions for saving of data for main or event loop
function saveResponseQNA(slotValue, qnaObj, session, callback) {
    var sessionAttributes = session.attributes;
	var processor = sessionAttributes.currentProcessor;
    var retUser = session.attributes.retUser;
    
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
		//MM 5-9-2018 Added handler for setting dictionary id from Alexa intent schema
			//console.log(' LogosHelper.saveResponseQNA : Field is Dictionary type, get ID >>>>>> '+qnaObj.isDictionary);
			if (sessionAttributes.answerID !== '') {
				//console.log('Loop 1: ' +  sessionAttributes.answerID + ' is the answerid');
				dbUtil.readDictionaryTerm(qnaObj, session, false, callback);				
			} else {
				console.log('Loop 2: Goto read Dictionary');
				dbUtil.readDictoinaryId(qnaObj, slotValue, processor, false, session, callback);
			}
    	} else if (qnaObj.formatId !== undefined && qnaObj.formatId !== null && qnaObj.formatId !== "") {
			console.log(' LogosHelper.saveResponseQNA : Field has format ID to format user input >>>>>> '+qnaObj.formatId);
			//validate user input against RegEx formatter, if error throw response otherwise continue
			dbUtil.validateData(qnaObj, slotValue, processor, session, callback);
		} else {
			qnaObj.answer = slotValue;
			dbUtil.saveResponse(qnaObj, session, callback);
		}
    } else if (!isEmpty(qnaObj.eventQNArr)){
		var eventQNArr = qnaObj.eventQNArr;
		console.log(' LogosHelper.saveResponseQNA >>>>>> Event script processing eventQNAArr: ', eventQNArr);
		eventQNArr.answer = slotValue;		
		if (eventQNArr.isDictionary !== null  && eventQNArr.isDictionary.toLowerCase() == 'y') {
			//MM 5-9-2018 Added handler for setting dictionary id from Alexa intent schema
			console.log(' LogosHelper.saveResponseQNA: Field is Dictionary type, get ID >>>>>> '+eventQNArr.isDictionary);
			if (sessionAttributes.answerID !== '') {
				dbUtil.readDictionaryTerm(qnaObj, session, true, callback);				
			} else {
				dbUtil.readDictoinaryId(qnaObj, eventQNArr.answer, processor, true, session, callback);
			}
		} else if (eventQNArr.formatId !== undefined && eventQNArr.formatId !== null && eventQNArr.formatId !== "") {
			console.log(' LogosHelper.saveResponseQNA: Field is Dictionary type, get ID >>>>>> '+eventQNArr.formatId);
			dbUtil.validateData(qnaObj, eventQNArr.answer, processor, session, callback);
		} else {
			console.log(' LogosHelper.saveResponseQNA: Call Update Event Details >>>>>> '+eventQNArr.answer);
			dbUtil.updateEventDetails(qnaObj, eventQNArr, eventQNArr.answer, session, callback);
		}
    } else {
    	processResponse(qnaObj, session, callback, retUser);
    }
}

//******************************************************************************************************/
//MM 12-12-18 THIS IS THE SECTION SPECIFIC EVENT HANDLERS WHICH RESPOND BACK TO ALEXA AND USER AS WELL AS THE SKILL 'CARD'
//******************************************************************************************************/

//MM 12-12-18 Takes next question from dbutil, replaces any attributes like [name] and sends response to Alexa/user
function processResponse(qnObj, session, callback, retUser) {
	console.log('LogosHelper.processResponse: currentProcess>>> ' + session.attributes.currentProcessor);	
    var sessionAttributes = session.attributes;
    var userName = sessionAttributes.logosname;
    var primaryName = sessionAttributes.primaryAccHolder;
    var quest = '';
	
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
  	quest = "There is an error retrieving the question.  If this persists, please contact customer service.  Restarting Logoshealth.  Main menu.  For a list of options, simply say, menu"
	  processMenuResponse(quest, session, callback);  
  }	
	var speechOutput = "";
	if (session.attributes.retUser) {
		//Handling user who has not yet completed profile
		speechOutput = 'Hello '+userName+'. Welcome back to Logos Health!. Your profile is incomplete!. Say Yes to continue, No to exit Logos Health.';
		qnObj.processed = false;
	} else {
		speechOutput = quest;
		qnObj.processed = true;
	}

	var cardTitle = 'Profile QnA';

	var repromptText = quest;
	var shouldEndSession = false;
	
	if (!session.attributes.scriptComplete){
		console.log("Current Processor being changed from " + session.attributes.currentProcessor + " to 3.");
		session.attributes.currentProcessor = 3;		
	}
	session.attributes.qnaObj = qnObj;
	console.log(' LogosHelper.processResponse >>>>>>: output text is '+speechOutput);
	session.attributes.lastMessage = speechOutput;
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 12-12-18 Processing event-specific loop response
function processEventResponse(qnObj, session, callback, retUser) {
	console.log('LogosHelper.processEventResponse : CALLED>>> ');	
    var sessionAttributes = session.attributes;
    var userName = sessionAttributes.logosname;
    var primaryName = sessionAttributes.primaryAccHolder;
    var quest = '';
 
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
	var cardTitle = 'Profile QnA';
	var repromptText = quest;
	var shouldEndSession = false;

	if (session.attributes.retUser) {
		speechOutput = 'Hello '+userName+'. Welcome back to Logos Health!. Your profile is incomplete!. Say Yes to continue, No to exit Logos Health';
		qnObj.processed = false;
	} else {
		speechOutput = quest;
		qnObj.processed = true;
	}
	if (!session.attributes.scriptComplete){
		session.attributes.currentProcessor = 3;		
	}	
	console.log(' LogosHelper.processEventResponse >>>>>>: output text is '+speechOutput);
	session.attributes.lastMessage = speechOutput;
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 12-12-18 Processes Error Response
function processErrorResponse(errorText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    var cardTitle = 'Input Error';
    var repromptText = errorText;
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = errorText;	
	console.log('LogosHelper.processErrorResponse>: output text is '+speechOutput);
	session.attributes.lastMessage = speechOutput;
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 7-18-17 Added a session ending response - initially for users who do not want to create an account
function processExitResponse(errorText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    var cardTitle = 'Exiting Logos Health';
    var repromptText = '';
    var shouldEndSession = true;
    session.attributes.currentProcessor = processor;
    speechOutput = errorText;
	console.log('LogosHelper.processExitResponse>: output text is '+speechOutput);
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 12-12-18 Processes Error Response
function processHelpResponse(helpText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    var cardTitle = 'Help Text';
    var repromptText = helpText;
    var shouldEndSession = false;
	session.attributes.currentProcessor = processor;
    speechOutput = helpText;
	session.attributes.lastMessage = speechOutput;
	console.log('LogosHelper.processHelpResponse>: output text is '+speechOutput);  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processConfirmResponse(confirmText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');    
    var cardTitle = 'Confirm Action Text';
    var repromptText = confirmText;
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = confirmText;	
	console.log('LogosHelper.processConfirmResponse>: output text is '+speechOutput);
	session.attributes.lastMessage = speechOutput;
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 12-12-18 The Response for Entering a Profile
function processSelectionResponse(speechOutput, session, callback) {
	console.log('LogosHelper.processSelectionResponse : CALLED>>> ');	
    var cardTitle = 'Enter Your Profile';
    var repromptText = speechOutput;
   	var shouldEndSession = false;
	session.attributes.lastMessage = speechOutput;
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 01-08-19 The Response Main Menu categories
function provideMenuCategory(speechOutput, session, callback) {
	console.log('LogosHelper.provideMenuCategory: CALLED>>> ');	
    var cardTitle = 'Choose a Menu Category';
    var repromptText = speechOutput;
	var shouldEndSession = false;
	session.attributes.lastMessage = speechOutput;
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 01-08-19 The Main Menu options
function provideMenuOptions(speechOutput, session, callback) {
	console.log('LogosHelper.provideMenuOptions: CALLED>>> ');	
    var cardTitle = 'Choose from the following Menu Options';
    var repromptText = speechOutput;
   	var shouldEndSession = false;
	session.attributes.lastMessage = speechOutput;
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processMenuResponse(speechOutput, session, callback) {
	console.log('LogosHelper.processMenuResponse : CALLED>>> ');	
    var cardTitle = 'Main Menu';
    var repromptText = speechOutput;
	//Set branch to main menu
    session.attributes.currentProcessor = 5;  
	var shouldEndSession = false;  
	session.attributes.lastMessage = speechOutput;
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processRepeatRequest(speechOutput, session, callback) {
	console.log('LogosHelper.processRepeatRequest : CALLED>>> ');	
    var cardTitle = 'Repeat Request';
    var repromptText = speechOutput;
	var shouldEndSession = false;  
	session.attributes.lastMessage = speechOutput;
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 02-28-18  Constructs the OrderMeal Response
function constructOrderMealResp(action, session, callback) {
	var strResponse;
	var sessionAttributes = session.attributes;
	
	if (action == 'meal') {
		if (sessionAttributes.mealConfig.hasAllConfig) {
			strResponse = "Here are meals which fit your preferences. To order the current meal, say 'order'.  Say 'details', to hear more information about this meal. " +
			"Say 'nutrition', to get nutrition info.  Say 'next', for the next meal option or 'main menu', to exit to the main menu.  First Option, "
			+ sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +
			" from " + sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " which costs " +
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].cost + " dollars.";
		} else {
			strResponse = "Here are meal options. You can better target these options by completing the food and nutrition preference sections.  To order the current meal, say 'order'.  Say 'details', to hear more information about this meal. " +
			"Say 'nutrition', to get nutrition info.  Say 'next', for the next meal option or 'main menu', to exit to the main menu.  First Option, "
			+ sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +
			" from " + sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " which costs " +
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].cost + " dollars.";
		}
		//processor 9 = Order a Meal branch
		processOrderMealResponse(strResponse, 9, session, callback);		
	} else if (action == 'order') {
		strResponse = "Call " + sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " at " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].phone + 
			".  In the future, I will make this call for you through the Echo device.  Main Menu.  For a list of options, simply say, menu.";
		processMenuResponse(strResponse, session, callback);						
	} else if (action == 'next') {
		//iterates to next option
		sessionAttributes.currentMenuIndex = sessionAttributes.currentMenuIndex + 1;
		if(sessionAttributes.currentMenuIndex < sessionAttributes.miBatchCount) {
			strResponse = sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +" from " + 
				sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " which costs " + 
				sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].cost + " dollars.";
			//processor 9 = Order a Meal branch
			processOrderMealResponse(strResponse, 9, session, callback);				
		} else {
			strResponse = "There are no further options available at this time.  Main menu.  For a list of options, simply say, menu.";
			processMenuResponse(strResponse, session, callback);						
		}
	} else if (action == 'next batch') {
			strResponse = sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +" from " + 
				sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " which costs " + 
				sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].cost + " dollars.";
		//processor 9 = Order a Meal branch
		console.log("Next batch built");
		processOrderMealResponse(strResponse, 9, session, callback);						
	} else if (action == 'details') {
		strResponse = sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +" is described as " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].description;
		//processor 9 = Order a Meal branch
		processOrderMealResponse(strResponse, 9, session, callback);						
	} else if (action == 'nutrition') {
		strResponse = sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +" has " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].calories + " calories, " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].totalfat + " grams of total fat, " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].carbs + " grams of carbs, and " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].protein + " grams of protein";		
		processOrderMealResponse(strResponse, 9, session, callback);						
	} else if (action == 'main menu') {
		strResponse = "Exiting Order a Meal.  Main Menu.  For a list of options, simply say, menu.";
		processMenuResponse(strResponse, session, callback);						
	} else {
		strResponse = "This is not a valid response.  Please choose respond with one of the following options: order, details, nutrition, next, or main menu.";
		//processor 9 = Order a Meal branch
		processOrderMealResponse(strResponse, 9, session, callback);
	}
}

//MM 02-28-18  Delivers Order Meal Response to Alexa
function processOrderMealResponse(helpText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');    
    var cardTitle = 'Order a Meal';
    var repromptText = 'Are you there?  Please respond with one of the following options: order, details, nutrition, next, or main menu';
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = helpText;	
	console.log('LogosHelper.processOrderMealResponse>: output text is '+speechOutput);
	console.log('LogosHelper.processOrderMealResponse>: CurrentProcessor is '+ session.attributes.currentProcessor);
	session.attributes.lastMessage = speechOutput;
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//************************************************************************************************/
//UTILITY FUNCTIONS
//************************************************************************************************/
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//MM 5-8-2018 Added function to ensure validity of date values	
function isValidDate(slotValue) {
	var equalSplit = slotValue.split("-");
	if (equalSplit[0] > 1000 && equalSplit[0] < 3000 && equalSplit[1] > 0 && equalSplit[1] < 13 && equalSplit[2] >= 0 && equalSplit[2] < 32) {
		return true;
	} else {
		console.log('IsValidDate is false: year: ' + equalSplit[0] + ' month: ' + equalSplit[1] + ' day: ' + equalSplit[2]);
		return false;
	}
}

function spellWord(intent) {
//MM 7-26-17 Added function to enable word spelling feature 
	var spelledWord = '';
	if (intent.slots.Letter.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letter.value.charAt(0).toUpperCase();
	}
	if (intent.slots.Letterb.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterb.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterc.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterc.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterd.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterd.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Lettere.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Lettere.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterf.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterf.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterg.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterg.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterh.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterh.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letteri.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letteri.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterj.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterj.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterk.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterk.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterl.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterl.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterm.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterm.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Lettern.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Lettern.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Lettero.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Lettero.value.charAt(0).toLowerCase();
	}
    return spelledWord;
}

function translateDay2DatePast(session, slotValue, timezone) {
	var localDT;
	var localToday;
	var dtReturn;
	var intToday;
	var intSlotValue = -1;
	var dayDiff;
	var offset = 0;

	if (timezone !== 'utc') {
		localDT = moment.tz(timezone);
		localToday = moment.tz(timezone).format('YYYY-MM-DD HH:mm');
		intToday = moment.tz(timezone).format('d');
		intToday = Number(intToday);
		offset = moment.tz(localToday, 'YYYY-MM-DD HH:mm', timezone).utcOffset() / 60;
		offset = offset * -1;
		session.attributes['utcoffset'] = offset;
	} else {
		localDT = moment();
		localToday = moment().format('YYYY-MM-DD HH:mm');
		intToday = moment().format('d');
		intToday = Number(intToday);
		session.attributes['utcoffset'] = 0;
	}

	if (slotValue.toLowerCase() == 'today') {
		dtReturn = localDT.startOf('day').add(offset, 'hours').format('YYYY-MM-DD HH:mm');
	} else if (slotValue.toLowerCase() == 'yesterday') {
		dtReturn = localDT.subtract(1, 'days').format('YYYY-MM-DD HH:mm');
	} else if (slotValue.toLowerCase() == 'sunday') {
		intSlotValue = 0;
	} else if (slotValue.toLowerCase() == 'monday') {
		intSlotValue = 1;
	} else if (slotValue.toLowerCase() == 'tuesday') {
		intSlotValue = 2;
	} else if (slotValue.toLowerCase() == 'wednesday') {
		intSlotValue = 3;
	} else if (slotValue.toLowerCase() == 'thursday') {
		intSlotValue = 4;
	} else if (slotValue.toLowerCase() == 'friday') {
		intSlotValue = 5;
	} else if (slotValue.toLowerCase() == 'saturday') {
		intSlotValue = 6;
	} else {
		dtReturn = 'error';
	}

	if (intSlotValue == -1) {		
		return dtReturn;		
	} else {
		if (intToday <= intSlotValue) {
			intToday = intToday + 7;
		}
		dayDiff = intToday - intSlotValue;
		var dtTemp;
		var dtTempStr;

		//The dtReturn should provide the UTC date/time equivalent to 12:00 AM on day of measure.
		dtReturn = localDT.subtract(dayDiff, 'days').startOf('day').add(offset, 'hours').format('YYYY-MM-DD HH:mm');

		//Date transformation - starts here:		
		dtTemp = localDT.subtract(dayDiff, 'days');
		dtTempStr = dtTemp.format('YYYY-MM-DD HH:mm');
		console.log('translateDay2DatePast Date Tranformation Step 1 - subtract days: ' + dtTempStr);

		dtTemp = dtTemp.startOf('day');
		dtTempStr = dtTemp.format('YYYY-MM-DD HH:mm');
		console.log('translateDay2DatePast Date Tranformation Step 2 - clear time: ' + dtTempStr);

		dtTemp = dtTemp.add(offset, 'hours');
		dtTempStr = dtTemp.format('YYYY-MM-DD HH:mm');
		console.log('translateDay2DatePast Date Tranformation Step 3 - add offset: ' + dtTempStr);

		return dtReturn;		
	}
}

function getIsoTime(session, slotValue) {
	var timeStr;
	var sessionAttributes = session.attributes;
	var hasPM = false;
	var hasAM = false;
	var foundTime = false;
	var timeStrSplit;
	var mainTimeStr;
	var mainTimeSplit;
	var mainHr = '0';
	var mainMin = '00';

	if (slotValue == 'noon') {
		timeStr = '12:00';
		return timeStr;
	} else if (slotValue == 'midnight') {
		timeStr = '0:00';
		return timeStr;
	}

	if (slotValue.indexOf('a.m.') !== -1 || slotValue.indexOf('am') !== -1) {
		hasAM = true;
	}

	if (slotValue.indexOf('p.m.') !== -1 || slotValue.indexOf('pm') !== -1) {
		hasPM = true;
	}

	timeStrSplit = slotValue.split(' ');
	if(timeStrSplit.length > 1) {
		for (var j = 0; j < timeStrSplit.length; j++) {
			if (!foundTime) {
				mainTimeStr = timeStrSplit[j]; 
				if (!isNaN(mainTimeStr)) {
					if (mainTimeStr.length < 3) {
						mainHr = mainTimeStr;
						foundTime = true;	
					} else if (mainTimeStr.length == 3) {
						mainHr = mainTimeStr.substring(0, 1);
						mainMin = mainTimeStr.substring(1, 3);
						foundTime = true;	
					} else if (mainTimeStr.length == 4) {
						mainHr = mainTimeStr.substring(0, 2);
						mainMin = mainTimeStr.substring(2, 4);
						foundTime = true;	
					}
				}				
			}
		}
		if(!foundTime) {
			console.log('****ALERT**** getIsoTime - cannot process split time string of: ' + slotValue);
			console.log('Passing back default time of 0:00 - before UTC transition');	
		}
	} else {
		mainTimeStr = slotValue;
		if (mainTimeStr.indexOf(':') !== -1) {
			mainTimeSplit = mainTimeStr.split();
			mainHr = mainTimeSplit[0];
			mainMin = mainTimeSplit[1]; 			
		} else {
			if (!isNaN(mainTimeStr)) {
				if (mainTimeStr.length < 3) {
					mainHr = mainTimeStr;	
				} else if (mainTimeStr.length == 3) {
					mainHr = mainTimeStr.substring(0, 1);
					mainMin = mainTimeStr.substring(1, 3);
				} else if (mainTimeStr.length == 4) {
					mainHr = mainTimeStr.substring(0, 2);
					mainMin = mainTimeStr.substring(2, 4);
				} else {
					console.log('****ALERT**** getIsoTime - cannot process lengthy time string of: ' + slotValue);
					console.log('Passing back default time of 0:00 - before UTC transition');	
				}
			} else {
				console.log('****ALERT**** getIsoTime - cannot process time string of: ' + slotValue);
				console.log('Passing back default time of 0:00 - before UTC transition');
			}
		}
	}

	if (!hasAM && ! hasPM) {
		//if the user did not provide AM/PM and the meal is lunch or dinner, translate to PM if value is below 
		if (sessionAttributes.meal !== undefined && sessionAttributes.meal.toLowerCase() == 'lunch') {
			if (Number(mainHr) < 8) {
				mainHr = Number(mainHr) + 12;
			}
		} else if (sessionAttributes.meal !== undefined && sessionAttributes.meal.toLowerCase() == 'dinner') {
			if (Number(mainHr) < 12 && Number(mainHr) > 3) {
				mainHr = Number(mainHr) + 12;
			}
		}
	}	
	timeStr = mainHr + ":" + mainMin;
	console.log('Final time string from getIsoTime: ' + timeStr);
	return timeStr;
}	

function setTime2DateofMeasure(session, slotValue) {
	var timezone;
	var sessionAttributes = session.attributes;
	var dtStr;
	var finalDtStr;
	var localDate;
	var offset; 
	var processed = false

	if (sessionAttributes.userTimezone !==undefined && sessionAttributes.userTimezone !==null && sessionAttributes.userTimezone !=="") {
		timezone = sessionAttributes.userTimezone;					
		dtStr = moment(sessionAttributes.dateofmeasure).format('YYYY-MM-DD');
		dtStr = dtStr + ' ' + slotValue;
		console.log('Date String local time for setTime2DateofMeasure: ' + dtStr);
		//using moment seems to factor in timezone automatically and treats dateStr as UTC
		localDate = moment(dtStr, 'YYYY-MM-DD H:mm');
		offset = localDate.tz(timezone).utcOffset()/60;
		//must multiply offset by two to push time to UTC 		
		offset = offset * -2;
		console.log('Pre-offset Date String setTime2DateofMeasure: ' + localDate.format('YYYY-MM-DD HH:mm') + ', offset = ' + offset);
		finalDtStr = localDate.add(offset, 'hours').format('YYYY-MM-DD HH:mm');
		console.log('Final Date String setTime2DateofMeasure: ' + finalDtStr);
		sessionAttributes.dateofmeasure = finalDtStr;
		processed = true;
		return processed;
	} else {
		timezone = 'utc';
		dtStr = moment(sessionAttributes.dateofmeasure).format('YYYY-MM-DD');
		dtStr = dtStr + ' ' + slotValue;
		localDate = moment(dtStr, 'YYYY-MM-DD H:mm');
		sessionAttributes.dateofmeasure = localDate.format('YYYY-MM-DD HH:mm');
		processed = true;
		return processed;
	}
}
