var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var ocean = {}; 

function is_array(obj) {
   return (obj.constructor.toString().indexOf("Array") == -1)
}
function getmax(puddle) {
    var count = 0;
    for (i in puddle.contents) {
        if (puddle.contents.hasOwnProperty(i)) {
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
            ocean[ puddle ].contents = {};
        }
            var puddle = ocean[ puddle ];

            var count = getmax(puddle);
            if (typeof puddle.contents[0] == 'undefined')
            {
                puddle.contents[0] = [];

            } else {
                puddle.contents[ count++ ] = [];
            }

            if (typeof puddle.config.fields[ data ] == 'undefined')
            {
                puddle.contents[getmax(puddle)-1].push(row);
                puddle.config.fields[ data ] = [];


                for (i=0;i<getmax(puddle);i++) {
                    if(puddle.contents[i].length < getmax(puddle.config.fields)) {
                        puddle.contents[i].push(null);
                    }
                }



            } else {
                puddle.contents[getmax(puddle)-1].push(row);
            }
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
        console.log(JSON.stringify(ocean))   
    }
}

var server = http.createServer(function(request, response) {
    var pathname = url.parse(request.url).pathname;
    checkurl(pathname,response,request);
});

server.listen(3000);

console.log('starting building'); 