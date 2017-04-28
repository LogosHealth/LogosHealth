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
exports.readDictoinaryId = function readDictoinaryId(qnaObj, value, processor, session, callback) {
  console.log(' DBUtils.readDictoinaryId >>>>>>');
  return getDictionaryId(qnaObj, value, processor, session, callback);
};

exports.validateData = function validateData(qnaObj, value, processor, session, callback) {
  console.log(' DBUtils.validateData >>>>>>');
  return validateUserInput(qnaObj, value, processor, session, callback);
};

/**
 * @public name is getScriptDetails
 * @VG 2/26 | Pass the script as the param to get all possible questions
 */
exports.readQuestsionsForBranch = function readQuestsionsForBranch(questionId, scriptName, slotValue, session, callback) {
  	console.log(' DBUtils.readQuestsionsForBranch >>>>>>' +scriptName);
  	getScriptDetails(questionId, scriptName, slotValue, session, callback, false);
};

/**
 * @public
 * @VG 2/28 | Expects session information as a user response passed here to create a profile
 */
exports.updateProfileDetails = function updateProfileDetails(qnaObj, session, callback){
  	console.log(' DBUtils.setProfileDetails >>>>>>'+qnaObj.answer);
  	setProfileDetails(qnaObj, session, callback);
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
function setTranscriptDetailsParent(newRec, qnaObj, session, callback){
    console.log("DBUtil.setTranscriptDetailsParent called with param >>>>> ");
	//Check if Staging has any record or not
    //var newRec = getStagingParentId(resArr, qnaObjArr, slotVal, session, callback);
    var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
    var profileId = sessionAttributes.userProfileId;
    if (newRec) {
        var stgRec = {profileid:profileId, uniquestepid:qnaObj.uniqueStepId,createdby:profileId,modifiedby:profileId};
        // 1. Insert into STG_Script table
        connection.query('Insert into logoshealth.stg_script Set ?',stgRec, function (error, results, fields) {
	    	if (error) {
            	console.log('The Error in insert is: ', error);
        	} else {
				console.log('The record inserted into STG_SCRIPT successfully and now calling STG_Record table function!!');
				closeConnection(connection); //all is done so releasing the resources
        		getStagingParentId(newRec, qnaObj, session, callback);
			}
        	
		});
    }
    else {
        connection.query('Update logoshealth.stg_script Set uniquestepid='+qnaObj.uniqueStepId+' where profileid='+profileId,function(error, results,fields) {
        	if (error) {
            	console.log('The Error in update is: ', error);
        	} else {
				console.log('The record updated into STG_SCRIPT successfully and now calling STG_Record table function!!');
				closeConnection(connection); //all is done so releasing the resources
        		getStagingParentId(newRec, qnaObj, session, callback);
			}
        });
    }
}//function ends here

function getStagingParentId(newRec, qnaObj, session, callback) {
	console.log("DBUtil.getStagingParentId called to get Staging script ID for value >>>  ");
	var connection = getLogosConnection();
	var stgId = "";
	
	var sessionAttributes = session.attributes;
    var profileId = sessionAttributes.userProfileId;
	
	var query = "select stg_scriptid from stg_script where profileid ="+profileId+" and uniquestepid="+qnaObj.uniqueStepId;
	console.log("DBUtil.getStagingParentId Select Query is >>> "+query);
	
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.getStagingParentId - Database QUERY ERROR >>>> ");
		} else {
			console.log('DBUtil.getStagingParentId - Query results '+results.length);
			
			if (results !== null && results.length > 0) {
                stgId = results[0].stg_scriptid;
       			console.log("DBUtil.getStagingParentId - Script ID retrieved as >>>> "+stgId);
    			
    			setTranscriptDetailsChild(newRec, stgId, qnaObj, session, callback);
            } else {
            	console.log("DBUtil.getDictionaryId - RegEx threw error for user input >>>> "+tempObj.errResponse);
    			//process error response
    			helper.processErrResponse("Couldn't find Staging Script Error - Admin Error ", processor, session, callback);
            }
		}
		closeConnection(connection); //all is done so releasing the resources
	});
}

//VG 4/13|Purpose: Set the STG tables with processed information 
//keyID will be the key from parent table STG_Script table
function setTranscriptDetailsChild(newRec, keyId, qnaObj, session, callback){
    console.log("DBUtil.setTranscriptDetailsChild called with param >>>>> "+keyId);
    //Only insert when the table changes
    if (newRec) {    
        var connection = getLogosConnection();
        var sessionAttributes = session.attributes;
        var profileId = sessionAttributes.userProfileId;
        var stgRec = {stg_scriptid:keyId, table:qnaObj.answerTable,recordid:qnaObj.answerFieldValue,createdby:profileId,modifiedby:profileId};
        // 1. Insert into STG_Record table
			connection.query('Insert into logoshealth.stg_records Set ?',stgRec, function (error, results, fields) {
			if (error) {
				console.log('The Error is: ', error);
			} else {
				console.log('The record inserted into STG_RECORDS successfully!!');
				closeConnection(connection); //all is done so releasing the resources
				loadStatusFromStaging(session.attributes.logosName, session.attributes.userProfileId, session.attributes.userHasProfile, session.attributes.profileComplete, session, callback);
			}
			
			});
    } else {
    	console.log('DBUtil.setTranscriptDetailsChild : No new record is required to insert');
		loadStatusFromStaging(session.attributes.logosName, session.attributes.userProfileId, session.attributes.userHasProfile, session.attributes.profileComplete, session, callback);
	}
    
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
function getScriptDetails(questionId, scriptName, slotValue, session, callback, retUser) {
	
	console.log("DBUtil.getScriptDetails called with param >>>>> Question ID " +questionId+ " and return user? "+retUser);
	
	var connection = getLogosConnection();
    var vSQL;
    
	if (questionId == 0){
        vSQL="SELECT q.*,s.* FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"' order by uniquestepid asc limit 1";
    }
    else {
        vSQL="SELECT q.*,s.* FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"' and uniquestepid="+questionId;    
    }
    console.log("DBUtil.getScriptDetails Query is  >>>>> " +vSQL);
    
    connection.query(vSQL, function (error, results, fields) {
    	
    	var qnaObj = {};
		if (error) {
            console.log('DBUtils.getScriptDetails Error. the Error is: ', error);
    	} else {
    
			console.log('DBUtils.getScriptDetails results gound. results length is : '+results.length);
			
			if (results !== null && results.length > 0) {
			
				qnaObj = {
					"questionId": results[0].questionid,
					"question": results[0].question,
					"answer": "",
					"processed": false,
					"uniqueStepId":results[0].uniquestepid,
					"scriptname":scriptName,
					"answerKey":results[0].answerkeyfield,
					"answerField":results[0].answerfield,
					"answerTable":results[0].answertable,
					"answerFieldValue":0,
					"insertNewRow":results[0].insertnewrow,
					"isDictionary":results[0].isdictionary,
					"formatId":results[0].formatid,
					"errResponse":results[0].errorresponse
				};
			
				console.log('DBUtils.getScriptDetails The QnA Objects is : '+qnaObj);
			}
                
		}
		closeConnection(connection); //all is done so releasing the resources
		console.log("DBUtil.getScriptDetails : Message send for return user? >>> "+retUser);
		session.attributes.retUser = retUser;
		//callback response with QnA object array
		helper.processQnAResponse(qnaObj, session, callback, retUser);
	});
}

//VG 2/28|Purpose: Read the answers and Insert/Update the Profile
function setProfileDetails(qnaObj, session, callback) {
        console.log("DBUtil.setProfileDetails for >>>>> "+qnaObj.answer);
        var connection = getLogosConnection();
        var sessionAttributes = session.attributes;
        var profileId = sessionAttributes.userProfileId;
        var logosName = sessionAttributes.logosName;
        console.log("DBUtil.setProfileDetails for >>>>> profileId : "+profileId);
        console.log("DBUtil.setProfileDetails for >>>>> uniquestepid : "+qnaObj.uniqueStepId);
        
        //profile check query
        var profChkQuery = "SELECT s.*,q.* from logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and uniquestepid="+qnaObj.uniqueStepId;
        
        console.log('DBUtil.setProfileDetails Profile retrieve query is - ' + profChkQuery);

        //Check 1: Profile doesn't exist therefore run insert
        connection.query(profChkQuery,function(error,results,fields) {
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
                                        fldVal = qnaObj.answer;
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
                                                                        getUniqueIdFromAnswerTable(qnaObj, qnaObj.answerTable, qnaObj.answerKey, profileId, session, callback);
                                                                }
                                                        });

                        } else { //insertRow != Yes hence execute update
                                var updateRec="Update "+tblName+" Set "+vFields+" ='"+qnaObj.answer+"' Where "+qnaObj.answerKey+"="+profileId; //resArr.answerFieldValue;
                                console.log("DBUtil.setProfileDetails - Update STMT >> ",updateRec);
                                connection = getLogosConnection();
                                connection.query(updateRec, function (error, results, fields) {
                                                                        if (error) {
                                                                                console.log('The Error is: DBUtil.setProfileDetails UPDATE- ', error);
                                                                        } else {
                                                                                console.log('The record UPDATED successfully into Profile Table!!');
                                                                                closeConnection(connection);
                                                                                //insert records into Parent Transcript Array - Staging scripts would redirect to Response process
                                                                                setTranscriptDetailsParent(false, qnaObj, session, callback);  
                                                                        }
                                                                });
                            }
                    }
            }
        }); //First Select SQL ends here
} //Funcion ends here


function getUniqueIdFromAnswerTable(qnaObj, tableNm, colNm, profileId, session, callback) {
	console.log("DBUtil.getUniqueIdFromAnswerTable called "+qnaObj.answer);
	var connection = getLogosConnection();
	var answerVal = "";
	var slotVal = qnaObj.answer;
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
                answerVal = results[0][qnaObj.answerKey];
                console.log("DBUtil.getUniqueIdFromAnswerTable - ID retrieved as >>>> "+answerVal);
                if (tableNm != null && tableNm.toLowerCase() == 'profile') {
                	profileId = results[0].profileid;
                	session.attributes.userProfileId = profileId;
                } 
                
                qnaObj.answerFieldValue = answerVal;
				closeConnection(connection);
				
				setTranscriptDetailsParent(true, qnaObj, session, callback);  //insert records into Parent Transcript Array
            } else {
            	console.log("DBUtil.getUniqueIdFromAnswerTable Results are empty, that mean no profile found which is created just now >>> "+query);
            }
		}
	});
}

function getDictionaryId(qnaObj, value, processor, session, callback) {
	console.log("DBUtil.getDictionaryId called to get Dictionary ID for value >>>  "+value);
	var connection = getLogosConnection();
	var dictId = "";
	var fields = qnaObj.answerField.split(",");
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
       			qnaObj.answer = dictId;
    			console.log(' DBUtil.getDictionaryId Found: Set Dictionary Id to temp and QnA Objects >>>>>> '+qnaObj.answer);
    			closeConnection(connection);
    			setProfileDetails(qnaObj, session, callback);
            } else {
            	console.log("DBUtil.getDictionaryId - RegEx threw error for user input >>>> "+qnaObj.errResponse);
    			//process error response
    			helper.processErrResponse(qnaObj.errResponse, processor, session, callback);
            }
		}
	});
}

function validateUserInput(qnaObj, value, processor, session, callback) {
	console.log("DBUtil.validateUserInput called to get regex script for value >>>  "+value);
	var connection = getLogosConnection();
	var regEx = "";
	var query = "select formatcode from logoshealth.format where formatid="+qnaObj.formatId;
	console.log("DBUtil.validateUserInput Select Query is >>> "+query);
	
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.validateUserInput - Database QUERY ERROR >>>> ");
		} else {
			console.log('DBUtil.validateUserInput - Query results '+results.length);
			
			if (results !== null && results.length > 0) {
                regEx = results[0].formatcode;
                var pattern = "";
                
                if (qnaObj.formatId == 1) {
                	//validate with zipcode
                	pattern = new RegExp("^[0-9]{5}(?:-[0-9]{4})?$");
                } else if (qnaObj.formatId == 2) {
                	//validate with phone number format
                	pattern = new RegExp("^\\d{10}$");
                } else if (qnaObj.formatId == 3) {
                	//validate with allowed data format yyyy-mm-dd TODO: actual date conversion is required.
                	pattern = new RegExp("^\d{4}-\d{2}-\d{2}$");
                	//pattern = new RegExp("date_format()");
                } else if (qnaObj.formatId == 4) {
                	//validate 9 digits
                	pattern = new RegExp("^\\d{9}$");
                } 
                
       			console.log("DBUtil.getDictionaryId - RegEx Format retrieved as >>>> "+regEx);
       			
       			//var pattern = new RegExp(results[0].formatcode);
       			if (pattern.test(value)) {
       				qnaObj.answer = value;
    				console.log(' LogosHelper.executeCreateProfileQNA Found Q answered: skipping to DB for isnert/update >>>>>> '+qnaObj.answer);
    				setProfileDetails(qnaObj, session, callback);
    			} else {
    				console.log("DBUtil.validateUserInput - RegEx threw error for user input >>>> "+qnaObj.errResponse);
    				//process error response
    				helper.processErrResponse(qnaObj.errResponse, processor, session, callback);
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
                profileComplete = results[0].iscomplete;
                profileId = results[0].profileid;
            }
        }
        connection.end();
        
        session.attributes.logosName = userName;
        
        // check if user has completed profile, if yes send them back to main menu
		// if not bring QnA object with current or last save point and respond. 
        if (profileComplete || !hasProfile) {
        	helper.processNameIntent(userName, profileId, hasProfile, profileComplete, session, callback);
        } else {
        	loadStatusFromStaging(userName, profileId, hasProfile, profileComplete, session, callback);
        }
    });
}

function loadStatusFromStaging(userName, profileId, hasProfile, profileComplete, session, callback) {
	console.log("DBUtil.loadStatusFromStaging called with param >>>>> "+profileId);
    var connection = getLogosConnection();
    var questionId = 0;
    
    console.log("DBUtil.loadStatusFromStaging called for the first time, is it? "+session.attributes.retUser);
    
    var retUser = false;
    
    // Get max available question id from staging using profile id
    //if no record found that mean user to start with First Question else max +1 question onwards
    connection.query("select max(uniquestepid) as uniquestepid from logoshealth.stg_script where profileid = "+profileId, function (error, results, fields) {
	if (error) {
            console.log('The Error is: ', error);
    } else {
		console.log('DBUtil.loadStatusFromStaging - The Staging Question ID found as '+results[0].uniquestepid);
		if (results.length > 0) {
			questionId = results[0].uniquestepid + 1;
			session.attributes.userProfileId = profileId;
			if (session.attributes.retUser == undefined) {
    			retUser = true;
    		}
		} 
	}
        closeConnection(connection); //all is done so releasing the resources
        var scriptName = "Create a New Primary Profile";
        console.log('DBUtil.loadStatusFromStaging - is User returing? '+retUser);
        getScriptDetails(questionId, scriptName, userName, session, callback, retUser);
	});
}

function closeConnection(connection) {
	connection.end();
}