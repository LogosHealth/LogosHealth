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
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.readDictoinaryId = function readDictoinaryId(tempObj, resArr, indx, value, processor, session, callback) {
  console.log(' DBUtils.readDictoinaryId >>>>>>');
  return getDictionaryId(tempObj, resArr, indx, value, processor, session, callback);
};

exports.validateData = function validateData(tempObj, resArr, indx, value, processor, session, callback) {
  console.log(' DBUtils.validateData >>>>>>');
  return validateUserInput(tempObj, resArr, indx, value, processor, session, callback);
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
exports.updateProfileDetails = function updateProfileDetails(resArr, qnaObjArr, resArrIndx, session, callback){
  	console.log(' DBUtils.setProfileDetails >>>>>>'+resArr.answer);
  	setProfileDetails(resArr, qnaObjArr, resArrIndx, session, callback);
};

/**
 * @public
 * @VG 3/13 | Manages Profile based script context in STAGING Table
 */
 
 
exports.setScriptContext = function setScriptContext(profileID, scriptID, scriptStep) {
  	console.log(' DBUtils.setScriptContext >>>>>>');
  	setScriptContext(profileID, scriptID, scriptStep);
 };
 
 
//VG 4/13|Purpose: Set the STG tables with processed information 
function setTranscriptDetailsParent(resArr, qnaObjArr, slotVal, session, callback){
    console.log("DBUtil.setTranscriptDetailsParent called with param >>>>> ");
	var connection = getLogosConnection();
	
	var sessionAttributes = session.attributes;
    var profileId = sessionAttributes.userProfileId;
    
    var stgRec = {profileid:profileId, uniquestepid:resArr.uniqueStepId,createdby:profileId,modifiedby:profileId};
    // 1. Insert into STG_Script table
    connection.query('Insert into logoshealth.stg_script Set ?',stgRec, function (error, results, fields) {
	if (error) {
            console.log('The Error is: ', error);
        } else {
			console.log('The record inserted into STG_SCRIPT successfully and now calling STG_Record table function!!');
			getStagingParentId(resArr, qnaObjArr, slotVal, session, callback);
		}
        	closeConnection(connection); //all is done so releasing the resources
		});
}//function ends here

function getStagingParentId(resArr, qnaObjArr, slotVal, session, callback) {
	console.log("DBUtil.getStagingParentId called to get Staging script ID for value >>>  ");
	var connection = getLogosConnection();
	var stgId = "";
	
	var sessionAttributes = session.attributes;
    var profileId = sessionAttributes.userProfileId;
	
	var query = "select stg_scriptid from stg_script where profileid ="+profileId+" and uniquestepid="+resArr.uniqueStepId;
	console.log("DBUtil.getStagingParentId Select Query is >>> "+query);
	
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.getStagingParentId - Database QUERY ERROR >>>> ");
		} else {
			console.log('DBUtil.getStagingParentId - Query results '+results.length);
			
			if (results !== null && results.length > 0) {
                stgId = results[0].stg_scriptid;
       			console.log("DBUtil.getStagingParentId - Script ID retrieved as >>>> "+stgId);
    			setTranscriptDetailsChild(stgId, resArr, qnaObjArr, slotVal, session, callback);
            } else {
            	console.log("DBUtil.getDictionaryId - RegEx threw error for user input >>>> "+tempObj.errResponse);
    			//process error response
    			helper.processErrResponse("Couldn't find Staging Script Error - Admin Error ", processor, session, callback);
            }
		}
	});
}

//VG 4/13|Purpose: Set the STG tables with processed information 
//keyID will be the key from parent table STG_Script table
function setTranscriptDetailsChild(keyId, resArr, qnaObjArr, slotVal, session, callback){
    console.log("DBUtil.setTranscriptDetailsChild called with param >>>>> ");
    var connection = getLogosConnection();
    
    var sessionAttributes = session.attributes;
    var profileId = sessionAttributes.userProfileId;
    
    var stgRec = {stg_scriptid:keyId, table:resArr.answerTable,recordid:resArr.answerFieldValue,createdby:profileId,modifiedby:profileId};
    // 1. Insert into STG_Record table
    connection.query('Insert into logoshealth.stg_records Set ?',stgRec, function (error, results, fields) {
	if (error) {
            console.log('The Error is: ', error);
        } else {
			console.log('The record inserted into STG_RECORDS successfully!!'+'--'+stgRec);
			helper.processQnAResponse(slotVal, qnaObjArr, session, callback);
		}
        	closeConnection(connection); //all is done so releasing the resources
		});
    
}//function ends here

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



//VG 2/26|Purpose: To pull script based questions for Alexa Madam
function getScriptDetails(scriptName, slotValue, session, callback)
{
	console.log("DBUtil.getScriptDetails called with param >>>>> " +scriptName);
	var connection = getLogosConnection();
	connection.query("SELECT q.*,s.* FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"' order by uniquestepid asc", function (error, results, fields) {
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
        				"scriptname":scriptName,
        				"answerKey":results[res].answerkeyfield,
        				"answerField":results[res].answerfield,
        				"answerTable":results[res].answertable,
        				"answerFieldValue":0,
        				"insertNewRow":results[res].insertnewrow,
        				"isDictionary":results[res].isdictionary,
        				"formatId":results[res].formatid,
        				"errResponse":results[res].errorresponse
                	};
                	QnAObjArr.push(qnaObj);
                }
                
                console.log('DBUtils.getScriptDetails The QnAObjArra Size: ', QnAObjArr.length);
                
			}
		}
		closeConnection(connection); //all is done so releasing the resources
		//callback response with QnA object array
		helper.processQnAResponse(slotValue, QnAObjArr, session, callback);
	});
}

//VG 2/28|Purpose: Read the answers and Insert/Update the Profile
function setProfileDetails(resArr, qnaObjArr, resArrIndx, session, callback)
{
        console.log("DBUtil.setProfileDetails for >>>>> "+resArr.answer);
        var connection = getLogosConnection();
        var sessionAttributes = session.attributes;
        var profileId = sessionAttributes.userProfileId;
        var logosName = sessionAttributes.logosName;
        console.log("DBUtil.setProfileDetails for >>>>> profileId : "+profileId);
        console.log("DBUtil.setProfileDetails for >>>>> uniquestepid : "+resArr.uniqueStepId);

        //Check 1: Profile doesn't exist therefore run insert
        connection.query("SELECT s.*,q.* from logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and uniquestepid="+resArr.uniqueStepId
                         ,function(error,results,fields) {
          if(error)  {
                console.log('The Error is: DBUtil.setProfileDetails - ', error);
          }
            else {
                    closeConnection(connection);
                    if (results !== null && results.length > 0) {
                        var rec;
                        var insertRec;
                        var tblName = results[0].answertable;
                        var vFields = results[0].answerfield;
                        vFields=vFields.split(","); //This will split based on the comma
                        //accountid, logosname, firstname
                        //profileid, dateofmeasure, weight
                        if(results[0].insertnewrow == 'Y') {
                            //vFields=vFields.split(","); //This will split based on the comma
                            insertRec = "Insert into "+tblName+"(createdby,modifiedby";
                            for (var i = 0; i < vFields.length; i++) {
                                console.log('The vField value in: DBUtil.setProfileDetails - ' + tblName+' >> and field split '+vFields[i]);
                                insertRec = insertRec+","+vFields[i];
                            }
                            insertRec=insertRec+") values('1','1'";
                            //+",'"+resArr.answer+"','"+resArr.answer+"')";
                            console.log("DBUtil.setProfileDetails - Insert STMT >> i="+i);
                            //Add the values for the columns now
                            for (var i = 0; i < vFields.length; i++) {
                                console.log(i+" - DBUtil.setProfileDetails - Inside second For loop >> vFields[i]="+vFields[i]);
                                switch(vFields[i].trim()) {
                                    case "accountid":
                                        fldVal = sessionAttributes.userAccId;
                                        break;
                                    case "profileid":
                                        fldVal = profileId; //FYI - assigned from sessionAttributes.userProfileId
                                        break;
                                    case "dateofmeasure":
                                        fldVal = new Date("2015-03-25T12:00:00-06:00");
                                        break;
                                    case "logosname":
                                    console.log(" - DBUtil.setProfileDetails - Case matched for "+vFields[i]);
                                        fldVal = logosName;
                                        break;
                                    default:
                                        fldVal = resArr.answer;
                                } //switch ends here
                                insertRec=insertRec+","+"'"+fldVal+"'";
                            }
                            insertRec=insertRec+" )";
                            console.log("DBUtil.setProfileDetails - Final Insert STMT >> "+insertRec);
                            connection = getLogosConnection();
                            connection.query(insertRec, function (error, results, fields) {
                                                                if (error) {
                                                                        console.log('The Error is: DBUtil.setProfileDetails INSERT- ', error);
                                                                } else {
                                                                        console.log('The record INSERTED successfully into Profile Table!!');
                                                                        closeConnection(connection);
                                                                        //getProfileIdByLogosName(resArr, qnaObjArr, session, callback);
                                                                        getUniqueIdFromAnswerTable(resArr, qnaObjArr, resArrIndx, resArr.answerTable, resArr.answerKey, profileId, session, callback);
                                                                }
                                                        });

                        } else { //insertRow != Yes hence execute update
                                var updateRec="Update "+tblName+" Set "+vFields+" ='"+resArr.answer+"' Where "+resArr.answerKey+"="+profileId; //resArr.answerFieldValue;
                                console.log("DBUtil.setProfileDetails - Update STMT >> ",updateRec);
                                connection = getLogosConnection();
                                connection.query(updateRec, function (error, results, fields) {
                                                                        if (error) {
                                                                                console.log('The Error is: DBUtil.setProfileDetails UPDATE- ', error);
                                                                        } else {
                                                                                console.log('The record UPDATED successfully into Profile Table!!');
                                                                                closeConnection(connection);
                                                                                //insert records into Parent Transcript Array - Staging scripts would redirect to Response process
                                                                                setTranscriptDetailsParent(resArr, qnaObjArr, resArr.answer, session, callback);  
                                                                        }
                                                                });
                            }
                    }
            }
        }); //First Select SQL ends here
} //Funcion ends here
    
function getProfileIdByLogosName(resArr, qnaObjArr, session, callback) {
	console.log("DBUtil.getProfileIdByLogosName called "+slotVal);
	var connection = getLogosConnection();
	var slotVal = resArr.answer;
	var profileId = "";
	var sessionAttributes = session.attributes;
	var query = "SELECT profileid FROM logoshealth.profile where logosname = '"+ sessionAttributes.logosName + "' and accountid = '"+sessionAttributes.userAccId+"'";
	console.log("DBUtil.getProfileIdByLogosName Select Query is >>> "+query);
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log('The Error is: ', error);
		} else {
			console.log('Get Profile ID select query works with records size '+results.length);
			if (results !== null && results.length > 0) {
                profileId = results[0].profileid;
                console.log("DBUtil.getProfileIdByLogosName - Profile ID retrieved as >>>> "+profileId);
                sessionAttributes.userProfileId = profileId;
				session.attributes = sessionAttributes;
				closeConnection(connection);
				helper.processQnAResponse(slotVal, qnaObjArr, session, callback);
            } else {
            	console.log("DBUtil.getProfileIdByLogosName Results are empty, that mean no profile found which is created just now >>> "+query);
            }
		}
	});
}

function getUniqueIdFromAnswerTable(resArr, qnaObjArr, resArrIdx, tableNm, colNm, profileId, session, callback) {
	console.log("DBUtil.getUniqueIdFromAnswerTable called "+slotVal);
	var connection = getLogosConnection();
	var answerVal = "";
	var slotVal = resArr.answer;
	var sessionAttributes = session.attributes;
	
	var query = "";
	if (tableNm != null && tableNm.toLowerCase() == 'profile') {
		query = "SELECT "+colNm+" FROM "+tableNm+" where logosname = '"+ sessionAttributes.logosName + "' and accountid = '"+sessionAttributes.userAccId+"'";
	} else {
		query = "SELECT "+colNm+" FROM "+tableNm+" where profileid = '"+profileId+"'";
	}
	
	console.log("DBUtil.getUniqueIdFromAnswerTable Select Query is >>> "+query);
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log('The Error is: ', error);
		} else {
			console.log('Get Answer Key Value select query works with records size '+results.length);
			if (results !== null && results.length > 0) {
                answerVal = results[0][resArr.answerKey];
                console.log("DBUtil.getUniqueIdFromAnswerTable - ID retrieved as >>>> "+answerVal);
                if (tableNm != null && tableNm.toLowerCase() == 'profile') {
                	profileId = results[0].profileid;
                	sessionAttributes.userProfileId = profileId;
                	qnaObjArr[resArrIdx].answerFieldValue = answerVal;
                } else {
                	qnaObjArr[resArrIdx].answerFieldValue = answerVal;
                }
                resArr.answerFieldValue = answerVal;
				closeConnection(connection);
				setTranscriptDetailsParent(resArr, qnaObjArr, slotVal, session, callback);  //insert records into Parent Transcript Array
            } else {
            	console.log("DBUtil.getUniqueIdFromAnswerTable Results are empty, that mean no profile found which is created just now >>> "+query);
            }
		}
	});
}

function getDictionaryId(tempObj, qnObj, indx, value, processor, session, callback) {
	console.log("DBUtil.getDictionaryId called to get Dictionary ID for value >>>  "+value);
	var connection = getLogosConnection();
	var dictId = "";
	var fields = tempObj.answerField.split(",");
	var field = fields[fields.length-1];
	var query = "SELECT dictionaryid FROM logoshealth.dictionary WHERE fieldname = '"+field.trim()+"' and (value = '"+value+"' OR dictionarycode = '"+value+"' )";
	console.log("DBUtil.getDictionaryId Select Query is >>> "+query);
	
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.getDictionaryId - Database QUERY ERROR >>>> ");
		} else {
			console.log('DBUtil.getDictionaryId - Query results '+results.length);
			
			if (results !== null && results.length > 0) {
                dictId = results[0].dictionaryid;
       			console.log("DBUtil.getDictionaryId - Dictionary ID retrieved as >>>> "+dictId);
       			tempObj.answer = dictId;
    			qnObj[indx].answer = dictId;
    			console.log(' DBUtil.getDictionaryId Found: Set Dictionary Id to temp and QnA Objects >>>>>> '+tempObj.answer);
    			closeConnection(connection);
    			setProfileDetails(tempObj, qnObj, indx, session, callback);
            } else {
            	console.log("DBUtil.getDictionaryId - RegEx threw error for user input >>>> "+tempObj.errResponse);
    			//process error response
    			helper.processErrResponse(tempObj.errResponse, processor, session, callback);
            }
		}
	});
}

function validateUserInput(tempObj, qnObj, indx, value, processor, session, callback) {
	console.log("DBUtil.validateUserInput called to get regex script for value >>>  "+value);
	var connection = getLogosConnection();
	var regEx = "";
	var query = "select formatcode from logoshealth.format where formatid="+tempObj.formatId;
	console.log("DBUtil.validateUserInput Select Query is >>> "+query);
	
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.validateUserInput - Database QUERY ERROR >>>> ");
		} else {
			console.log('DBUtil.validateUserInput - Query results '+results.length);
			
			if (results !== null && results.length > 0) {
                regEx = results[0].formatcode;
                var pattern = "";
                
                if (tempObj.formatId == 1) {
                	//validate with zipcode
                	pattern = new RegExp("^[0-9]{5}(?:-[0-9]{4})?$");
                } else if (tempObj.formatId == 2) {
                	//validate with phone number format
                	pattern = new RegExp("^\\d{10}$");
                } else if (tempObj.formatId == 3) {
                	//validate with phone number format
                	pattern = new RegExp("date_format()");
                } else if (tempObj.formatId == 4) {
                	//validate with phone number format
                	pattern = new RegExp("^\\d{9}$");
                }
                
       			console.log("DBUtil.getDictionaryId - RegEx Format retrieved as >>>> "+regEx);
       			
       			//var pattern = new RegExp(results[0].formatcode);
       			if (pattern.test(value)) {
       				tempObj.answer = value;
    				qnObj[indx].answer = value;
    				console.log(' LogosHelper.executeCreateProfileQNA Found Q answered: skipping to DB for isnert/update >>>>>> '+tempObj.answer);
    				setProfileDetails(tempObj, qnObj, indx, session, callback);
    			} else {
    				console.log("DBUtil.validateUserInput - RegEx threw error for user input >>>> "+tempObj.errResponse);
    				//process error response
    				helper.processErrResponse(tempObj.errResponse, processor, session, callback);
    			}
            } 
		}
		closeConnection(connection);
	});
}

function getLogosConnection() {
	console.log(' DBUtils.getLogosConnection >>>>>>');
	var connection = mysql.createConnection({
        host     : 'logoshealth.cc99l18g9gw3.us-east-1.rds.amazonaws.com',
        port      : '3306',
        user     : 'logosadmin', //yet to encrypt password and read from properties
        password : 'L0g0sH3alth', //yet to encrypt password and read from properties
        database: 'logoshealth'
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
                console.log("DBUtil.getUserProfileByName Profile ID found as  >>>>>"+results[0].profileid);
                hasProfile = true;
                profileComplete = true;
                profileId = results[0].profileid;
            }
        }
        connection.end();
        helper.processNameIntent(userName, profileId, hasProfile, profileComplete, session, callback);
    });
}

function closeConnection(connection) {
	connection.end();
}