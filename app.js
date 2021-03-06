var http = require('http'), url = require('url'), fs = require('fs'), qs = require('querystring');
var ocean = {};
var authkey, authed = false, authip, authuser = {};
var currentmaxfield = 0;
fs.stat('users', function(err, stat) {
    if(err == null) {
        authuser = JSON.parse(fs.readFileSync('users'));
        authed = true;
        console.log("Welcome back " + authuser.username + "! I read your backed up credentials and snuck them into the database ;)")
    } else if(err.code == 'ENOENT') {
        fs.writeFile('users', '[]');
        authuser = {};
    } else {
        console.log('Something weird happened: ', err.code);
    }
});                                                                                                                                                                                                                                                                                                                                                     
function is_array(obj) {
   return (obj.constructor.toString().indexOf("Array") == -1)
}
function getmax(data) {
    var count = 0;
    for (i in data) {
        if (data.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
}
function getusers() {
    var authuser = JSON.parse(fs.readFileSync('users'));
    if (typeof authuser.username !== 'undefined') {
        return true;
    }
}
function handlepuddles(type,data,puddle,row) {
    if(type == "add") {
        ocean[ data ] = {};
        ocean[ data ].config = {"fields": 1};
        ocean[ data ].contents  = ["key"];
        return true;
    }
    else if(type == "select") {
        var checkpuddle = ocean[data];
        if(checkpuddle != null) {
            selectedpuddle = ocean[data];
            return true;
        }
    }
    else if(type == "insert") {
        if (typeof ocean[ puddle ] == 'undefined') {
            ocean[ puddle ] = {};
            ocean[ puddle ].config = {};
            ocean[ puddle ].config.fields = {};
            ocean[ puddle ].config.general = {};
            ocean[ puddle ].config.general.highest = 0;
            ocean[ puddle ].contents = {};
            // idk if it's worth siplifying the redundant code in this to something like local.config, etc 
        }
        var puddle = ocean[ puddle ];
        var count = getmax( puddle.contents[ data ] );
        if (typeof puddle.contents[ data ] == 'undefined')
        {
            puddle.contents[ data ] = {};
            puddle.config.fields[ data ] = {};
        }
        if (typeof puddle.contents[ data ][0] == 'undefined')
        {
            for (i in puddle.config.fields) {
                // check to see if stuff needs to be added
                if(puddle.contents[ i ] == puddle.contents[ data ]) {
                    //adds null entries to make 'rows' an actual thing
                    // tbh i think this is way too hacky and there must be a better way of managing this issue.
                    // Will research.
                    for (a=0;a<currentmaxfield;a++) { puddle.contents[ i ][ a ] = null; }
                }
            }
            var count = getmax( puddle.contents[ data ] )
            puddle.contents[ data ][ count ] = row;
        } else {
            puddle.contents[ data ][ count++ ] = row;
        }
        count = 0;
        max = 0;
        for (i in puddle.contents) { 
            for (j in puddle.contents[i]) { max++; }
            if (count < max) { count = max; }
            max = 0;
        }
        currentmaxfield = count;
        return true;
    }
}
function checkauth(request) {
    if (authed == true) { return true; } else { return false; }
}
function handlethings(pathname,response,request) {
    var testnewpuddle = new RegExp('^/authenticate/?');
    if(testnewpuddle.test(pathname)) {
        if (checkauth(request) == false) {
            response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
            var authrequest = decodeURI(pathname.replace("/authenticate/",""));
            var arr = authrequest.split(",");
            if (typeof authuser.username == 'undefined' && authkey == arr[0]) {
                authed = true;
                authuser.username = arr[1];
                authuser.password = arr[2];
                fs.writeFile('users', JSON.stringify(authuser));
                authip = request.connection.remoteAddress;
                response.end("Successfully authenticated user from ip address: " + authip)
            } else if (authed == true && typeof authuser.username !== 'undefined' && authuser.username == arr[1] && authuser.password == arr[2] ) {
                authed = true;
                response.end("Successfully authenticated with previous credentials");             
            } else {
                response.end("The key or credentials you have attempted to authenticate with are incorrect. Please try again.");
            }
        }
        else
        {
            response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
            response.end("You are already authenticated with the server. :)")
        }
    }
    var insertintopuddle = new RegExp('^/insertintopuddle/?');
    if(insertintopuddle.test(pathname)) {
        if (checkauth(request)) {
            var rawstring = decodeURI(pathname.replace("/insertintopuddle/",""));
            var arr = rawstring.split(",");
            var puddleref = arr[0];
            var field = arr[1];
            var row = arr[2];
            // Write in a more logical method of data insertion i.e sql type ( {insert} data {where} criteria == something);
            // if(arr[1] == 'method = where')
            //  "method = something" could be a sexy way of doing this depending on what kinds of methods and defaults i implement from here on in.
            if (rawstring != '') {
                if (handlepuddles("insert",field,puddleref,row)) {
                    response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
                    response.end("successfuly populated table: '"+arr[0]+"'' with a row ("+arr[1]+") and a field within that. ("+arr[2]+")")
                } else {
                    response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
                    response.end('Unfortunately you did something dumb or wrong and your data was not added to the database.');
                }
            }
            else
            {
                response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
                response.end(fs.readFileSync('views/insert.html'));
            }
        }
        else
        {
            response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
            response.end("You are not authenticated with the server :(")
        }
    }

    var testgetusers = new RegExp('^/');
    if(testgetusers.test(pathname)) {
        response.writeHead(200, { 'Content-type': 'text/html; charset=utf-8' });
        response.end(JSON.stringify(ocean));  
    }
}
var server = http.createServer(function(request, response) {
    var pathname = url.parse(request.url).pathname;
    handlethings(pathname,response,request);
});
server.listen(3000);
console.log('initialized..'); 
authkey = process.pid>>Math.random();
console.log("Your sneaky key is: " + authkey);