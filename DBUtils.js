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
exports.getScriptDetails = function getScriptDetails(script, session, callback) {
  console.log(' DBUtils.getScriptDetails >>>>>>' +script);
  return getScriptDetails(script, session, callback);
};
/**
 * @public
 * @VG 2/28 | Expects session information as a user response passed here to create a profile
 */
exports.setProfileDetails = function setProfileDetails(accountid, event, session, callback){
  console.log(' DBUtils.setProfileDetails >>>>>>');
  setProfileDetails(accountid, event, session, callback);
};

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
	console.log("DBUtil.getUserProfileByName - Initiating SQL call ");
	connection.query("SELECT * FROM logoshealth.profile where logosname = '"+userName+ "' and accountid = '"+accountId+"'", function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
        } else {
            if (results !== null && results.length > 0) {
                hasProfile = true;
            }
            connection.end();
            helper.processNameIntent(userName, hasProfile, session, callback);
        }
    });
}

function closeConnection(connection) {
	connection.end();
}