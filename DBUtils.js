/**
 * LogosHealth App Database Utility. 
 * This Util has all support functions for DB operations, uses SQL driver supported classes & utilities for persistence 
 * Copyright Logos Health, Inc
 * 
 */

//global variables
var mysql = require('mysql');
var helper = require('./LogosHelper');

/**
 * Create a new Connection instance.
 * @param {object|string} config Configuration or connection string for new MySQL connection
 * @return {Connection} A new MySQL connection
 * @public
 */
exports.getDBConnection = function getDBConnection() {
  	console.log(' DBUtils.getDBConnection >>>>>>');
    return getLogosConnection();
};

/**
 * Closes an existing connection.
 * @param {object|string} an active connection object
 * @return {boolean} Whether connection is closed or not
 * @public
 */
exports.closeDBConnection = function closeDBConnection(connection) {
  console.log(' DBUtils.closeDBConnection >>>>>>');
  closeConnection();
  return true;
};

/**
 * Closes an existing connection.
 * @param {object|string} an active connection object
 * @return {boolean} Whether connection is closed or not
 * @public
 */
exports.getAccountIdFromEmail = function getAccountIdFromEmail(email, session, callback) {
  console.log(' DBUtils.getAccountIdFromEmail >>>>>>');
  loadAccountIDFromEmail(email, session, callback);
};

/**
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.getAllUserAccounts = function getAllUserAccounts() {
  console.log(' DBUtils.getAllUserAccounts >>>>>>');
  return loadUserAccounts();
};

/**
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.checkClassAccess = function checkClassAccess() {
  console.log(' DBUtils.checkClassAccess new >>>>>>');
  return true;
};

/**
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.verifyUserProfile = function verifyUserProfile(usrName, accountId, session, callback) {
  console.log(' DBUtils.verifyUserProfile >>>>>>');
  return getUserProfileByName(usrName, accountId, session, callback);
};

/**
 * @public name is getScriptDetails
 * @VG 2/26 | Pass the script as the param to get all possible questions
 */
exports.readQuestsionsForBranch = function readQuestsionsForBranch(scriptName, slotValue, session, callback) {
  	console.log(' DBUtils.readQuestsionsForBranch >>>>>>' +scriptName);
  	getScriptDetails(scriptName, slotValue, session, callback);
};

/**
 * @public
 * @VG 2/28 | Expects session information as a user response passed here to create a profile
 */
exports.updateProfileDetails = function updateProfileDetails(qnaObjArr, session, callback){
  	console.log(' DBUtils.setProfileDetails >>>>>>'+qnaObjArr.answer);
  	setProfileDetails(qnaObjArr, session, callback);
};

/**
 * @public
 * @VG 3/13 | Manages Profile based script context in STAGING Table
 */
 
 /*
exports.setScriptContext = function setScriptContext(profileID, scriptID, scriptStep) {
  	console.log(' DBUtils.setScriptContext >>>>>>');
  	setScriptContext(profileID, scriptID, scriptStep);
 };
 
 */
 
 //vg 3/12|Purpose: Set the context for specific Script's Step
//This function MUST be called after committing every step in the DB
/*
function setScriptContext(profileID, scriptID, scriptStep)
{
	console.log("DBUtil.setScriptContext called with param >>>>> " +scriptID+"-"+scriptStep);
	var connection = getLogosConnection();
	var totalStep; //To capture total steps in the script
	//get the totalSteps for every script
	connection.query("SELECT max(s.scriptstep) as totalSteps FROM logoshealth.script s where scriptid="+scriptID, function(error, results, fields) {
	if (error) {
            console.log('The Error in MAX scriptStep: ', error);
        } else
		{
			totalStep = results.totalSteps;
		}
	});
	var scriptNextStep=scriptStep+1;
	//Create a new STG record if STEP is 1
	if (scriptStep='1')
	{
		stgRec = {stg_scriptid:'1', scriptid:scriptID, profileid:profileID,scriptstep:scriptNextStep, createdby:'1',modifiedby:'1'};
		connection.query('Insert into logoshealth.stg_script Set ?',stgRec, function (error, results, fields) {
		if (error) 
		{
            console.log('The Error in INSERT stamt of logoshealth.stg_script: ', error);
        }
		}); //Insert STMT ends here
	}
	if ( scriptStep>1 && scriptStep!=totalStep)
	{
		connection.query("Update logoshealth.stg_script Set scriptstep="+scriptNextStep+" where profileid='" +profileID+"' and scriptID='"+scriptID+"'", function(error, results, fields) {
			if (error) 
			{
				console.log('The Error in UPDATE stamt of logoshealth.stg_script: ', error);
			}
		}); //Update STMT ends here
	}
	if (scriptStep=totalStep)
	{
		//Update the staging with final scriptStep# since script is completed
		connection.query("Update logoshealth.stg_script Set scriptstep="+scriptStep+" where profileid='" +profileID+"' and scriptID='"+scriptID+"'", function(error, results, fields) {
			if (error) 
			{
				console.log('The Error in UPDATE stamt of logoshealth.stg_script: ', error);
			}
		}); //Update STMT for final step ends here
	}
	connection.end();
}

//VG 2/25|Purpose: Insert a new Account Information in DB
function createNewAccountIDFromEmail(vEmail, session, callback, connection)
{
	var accountRec = ''; //{email:vEmail, password:'vgtiger',createdby:'1',modifiedby:'1'};
	connection.query('Insert into logoshealth.Account Set ?',accountRec, function (error, results, fields) {
	if (error) {
            console.log('The Error is: ', error);
        } else {
			console.log('The record seems inserted successfully and now calling LoadAccountIDFromEmail again!!');
			loadAccountIDFromEmail(vEmail, session, callback); //Semi-Recursive call. New buzzword from VG.
		}
		});
}

*/

//VG 2/26|Purpose: To pull script based questions for Alexa Madam
function getScriptDetails(scriptName, slotValue, session, callback)
{
	console.log("DBUtil.getScriptDetails called with param >>>>> " +scriptName);
	var connection = getLogosConnection();
	connection.query("SELECT q.* FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"' order by uniquestepid asc", function (error, results, fields) {
	var QnAObjArr = [];
	var qnaObj;
	
	if (error) {
            console.log('DBUtils.getScriptDetails Error. the Error is: ', error);
        } else {
            if (results !== null && results.length > 0) {
                for (var res in results) {
                	qnaObj = {
                		"questionId": results[res].questionid,
        				"question": results[res].question,
        				"answer": "",
        				"processed": false,
        				"uniqueStepId":results[res].uniquestepid,
        				"scriptname":scriptName
                	}
                	QnAObjArr.push(qnaObj);
                }
                
                console.log('DBUtils.getScriptDetails The QnAObjArra Sie: ', QnAObjArr.length);
                
			}
		}
		closeConnection(connection); //all is done so releasing the resources
		//callback response with QnA object array
		helper.processQnAResponse(slotValue, QnAObjArr, session, callback);
	});
}

//VG 2/28|Purpose: Read the answers and Insert/Update the Profile 
function setProfileDetails(qnaObjArr, session, callback)
{
	console.log("DBUtil.setProfileDetails for >>>>> "+qnaObjArr.answer);
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var profileId = sessionAttributes.userProfileId;
	console.log("DBUtil.setProfileDetails for >>>>> profileId : "+profileId);
	
	//Check 1: Profile doesn't exist therefore run insert
		if (profileId == 0) {
			var accountRec = {'accountid':sessionAttributes.userAccId, 'firstname':qnaObjArr.answer, createdby:'1',modifiedby:'1'};
			connection.query('Insert into logoshealth.profile Set ?',accountRec, function (error, results, fields) {
				if (error) {
					console.log('The Error is: DBUtil.setProfileDetails - ', error);
				} else {
					console.log('The record inserted successfully into Profile Table!!');
				}
			});
		} else {
			connection.query("Update logoshealth.profile Set lastname='"+qnaObjArr.answer+"' where accountid="+sessionAttributes.applicationAccId, function(error, results,fields){
				if (error) {
					console.log('The Error in UPDATE lastname is: DBUtil.setProfileDetails -  ', error);
				} else {
					console.log('The record updated successfully into Profile Table for step 2 !!');
				}
			});
		}
		closeConnection(connection);
		getProfileIdByLogosName (qnaObjArr, session, callback);
}

function getProfileIdByLogosName(qnaObjArr, session, callback) {
	console.log("DBUtil.getProfileIdByLogosName called ");
	var connection = getLogosConnection();
	var profileId = "";
	var sessionAttributes = session.attributes;
	
	connection.query("SELECT profileid FROM logoshealth.profile where logosname = '"+ sessionAttributes.logosName + "' and accountid = '"+sessionAttributes.accountId+"'", function (error, results, fields) {
		if (error) {
			console.log('The Error is: ', error);
		} else {
			console.log('Get Profile ID select query works');
			if (results !== null && results.length > 0) {
                profileId = results[0];
                console.log("DBUtil.getProfileIdByLogosName - Profile ID retrieved as >>>> "+profileId);
                sessionAttributes.userProfileId = profileId;
				session.attributes = sessionAttributes;
				closeConnection(connection);
				helper.processQnAResponse(qnaObjArr.answer, qnaObjArr, session, callback);
            }
		}
	});
}

function getLogosConnection() {
	console.log(' DBUtils.getLogosConnection >>>>>>');
	var connection = mysql.createConnection({
        host     : 'logoshealth.cc99l18g9gw3.us-east-1.rds.amazonaws.com',
        port      : '3306',
        user     : 'logosadmin', //yet to encrypt password and read from properties
        password : 'L0g0sH3alth'  //yet to encrypt password and read from properties
    });
    
    return connection;
}

function loadUserAccounts() {
	var connection = getLogosConnection();
	var accountsArr = [];
	connection.query('SELECT * FROM logoshealth.Account', function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
        } else {
            if (results !== null && results.length > 0) {
                for (var res in results) {
                    console.log('DBUtils - Record row is >>>> : ', results[res]);
                    accountsArr.push(results[res]);
                }
            }
            connection.end();
        }
    });
    
    return accountsArr;
}

function loadAccountIDFromEmail(email, session, callback) {
	console.log("DBUtil.getAccountFromEmail called with param >>>>> "+email);
	var connection = getLogosConnection();
	var accountid = "";
	connection.query("SELECT accountid FROM logoshealth.Account where email = '"+ email + "'" , function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
        } else {
            if (results !== null && results.length > 0) {
                for (var res in results) {
                    console.log('DBUtils - Email found from account table >>>> : ', results[res]);
                    accountid = results[res].accountid;
                    helper.displayWelcomeMsg(accountid, session, callback);
				    console.log('DBUtils - AccountID from email inside loop>>> : ', accountid);
                }
            }
            connection.end();
        }
    });
    
    console.log('DBUtils - AccountID from email outside of loop near return>>> : ', accountid);
    return accountid;
}

function getUserProfileByName(userName, accountId, session, callback) {
    console.log("DBUtil.getUserProfileByName called with param >>>>> "+userName+" and "+accountId);
    
	var connection = getLogosConnection();
	var hasProfile = false;
	var profileComplete = false;
	var profileId = 0;
	console.log("DBUtil.getUserProfileByName - Initiating SQL call ");
	connection.query("SELECT * FROM logoshealth.profile where logosname = '"+userName+ "' and accountid = '"+accountId+"'", function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
        } else {
            if (results !== null && results.length > 0) {
                console.log("DBUtil.getUserProfileByName Profile ID found as  >>>>>"+results.profileid);
                hasProfile = true;
                profileId = results.profileid;
            }
        }
        connection.end();
        helper.processNameIntent(userName, profileId, hasProfile, profileComplete, session, callback);
    });
}

function closeConnection(connection) {
	connection.end();
}