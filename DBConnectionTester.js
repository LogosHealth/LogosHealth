
// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context, callback) {
    console.log(" DBConnector received a Call from Route ");
    /*
    exports.checkConnection(event, callback, function(res) {
        context.succeed(res) 
    });
    */
    checkDBConnection(event, context, callback);

};


function checkDBConnection(event, context, callback) {
   console.log('Check DB Called : ', context);
    var mysql = require('mysql')
    var connection = mysql.createConnection({
        host     : 'logoshealth.cc99l18g9gw3.us-east-1.rds.amazonaws.com',
        port      : '3306',
        user     : 'logosadmin',
        password : 'L0g0sH3alth'  //yet to encrypt password

    });
    
    connection.connect();
    console.log("The connection is "+connection);
    connection.query('SELECT * FROM logoshealth.Account', function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
        } else {
            //console.log('Result set Array is : ', results);
            /*
            if (results !== null && results.length > 0) {
                for (var res in results) {
                    console.log('Row is : ', results[res]);
                }
                
            }
            */
            console.log('Connection Successfully Established <<<<<< '+results);
            callback(null,results);
            connection.end();
        }
    });

}

exports.checkConnection = function(event, context) {

  var mysql = require('mysql')
  var connection = mysql.createConnection({
        host     : 'logoshealth.cc99l18g9gw3.us-east-1.rds.amazonaws.com',
        port      : '3306',
        user     : 'logosadmin',
        password : 'L0g0sH3alth'  //yet to encrypt password

    });
    
    connection.connect();
    console.log("The connection is "+connection);
    connection.query('SELECT * FROM logoshealth.Account', function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
        } else {
            //console.log('Result set Array is : ', results);
            if (results !== null && results.length > 0) {
                for (var res in results) {
                    console.log('Row is : ', results[res]);
                }
                
            }
            console.log('Connection Successfully Established <<<<<< ');
        }
    });

  connection.end();
  //context.callbackWaitsForEmptyEventLoop = false;
   //context.succeed(results);
};
