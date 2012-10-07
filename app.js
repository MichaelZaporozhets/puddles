var http = require('http'), url = require('url'), fs = require('fs'), qs = require('querystring');
var ocean = {}; 
var authkey, authed = false, authip;
var currentmaxfield = 0;

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
                if(puddle.contents[ i ] == puddle.contents[ data ]) {
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
function errormsg() {
    return "something broke :c";
}
function checkauth(request) {
    if (authed == true && request.connection.remoteAddress == authip) { return true; } else { return false; }
}
function handlethings(pathname,response,request) {
    var testnewpuddle = new RegExp('^/authenticate/?');
    if(testnewpuddle.test(pathname)) {
        if (checkauth(request) == false) {
            response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
            authrequest = decodeURI(pathname.replace("/authenticate/",""));
            if (authrequest == authkey) {
                authed = true;
                authip = request.connection.remoteAddress;
                response.end("Successfully authenticated user from ip address: " + authip)
            } else {
                response.end("The key you have attempted to authenticate with is incorrect. Please try again.");
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
            response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
            if (handlepuddles("insert",field,puddleref,row)) {
                response.end("Successfully Added some data woo")
            } else {
                response.end(errormsg());
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
        response.end("<script> console.dir(JSON.parse('"+JSON.stringify(ocean)+"')) </script>" + JSON.stringify(ocean) );  
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