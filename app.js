var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var ocean = {}; 

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
                var placeholdercount = 0;
                for (i in puddle.config.fields) {
                    if(puddle.contents[ i ] !== puddle.contents[ data ]) {
                        puddle.contents[ i ]["//ADD PLACEHOLDERS FOR MISSING DATA//"] = {};
                    }
                }
                var count = getmax( puddle.contents[ data ] )

                puddle.contents[ data ][ count ] = row;


            } else {

                puddle.contents[ data ][ count++ ] = row;
            }
            console.log("The size of " + data + " is " + getmax( puddle.contents[ data ] ));
            if (puddle.config.general.highest < getmax( puddle.contents[ data ] )) {
                
            }

            var count = -1;
            var find;
            for (i in puddle.contents) {
                if (getmax( puddle.contents[ i ] ) > count) {
                    count = getmax( puddle.contents[ i ] );
                }
            }
            console.log("The largest field has " + count + " entries.")

            return true;
    }
}



function errormsg() {
    return "something broke :c";
}

function checkurl(pathname,response,request) {
    var testnewpuddle = new RegExp('^/newpuddle/?');
    if(testnewpuddle.test(pathname)) {

        response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});

        newpuddlename = decodeURI(pathname.replace("/newpuddle/",""));
        if (handlepuddles("add",newpuddlename)) {
            response.end("Successfully Added a new puddle! :D")
        } else {
            response.end(errormsg());
        }
    }
    var insertintopuddle = new RegExp('^/insertintopuddle/?');
    if(insertintopuddle.test(pathname)) {
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

    var testreadpuddle = new RegExp('^/readselectedpuddle/?');
    if(testreadpuddle.test(pathname)) {
        var puddlename = pathname.replace("/selectpuddle/","");
        response.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
        response.end("Selected Puddle Contents: " + selectedpuddle.toString())
    }

    var testgetusers = new RegExp('^/');
    if(testgetusers.test(pathname)) {
        response.writeHead(200, { 'Content-type': 'text/html; charset=utf-8' });
        response.end("<script> console.dir(JSON.parse('"+JSON.stringify(ocean)+"')) </script>" + JSON.stringify(ocean) );  
    }
}

var server = http.createServer(function(request, response) {
    var pathname = url.parse(request.url).pathname;
    checkurl(pathname,response,request);
});

server.listen(3000);

console.log('starting building'); 