var https  = require('https');
var fs     = require('fs');

var text   = process.argv[2];
var ldpc   = process.argv[3] || 'https://localhost/pub/';
var name   = process.argv[4] || 'Melvin Carvalho';
var webid  = process.argv[5] || 'http://melvincarvalho.com/#me';
var avatar = process.argv[6] || 'http://melvincarvalho.com/melvincarvalho.png';

var path = '/' + ldpc.split('/').slice(3).join('/');

var today = new Date().toISOString().substr(0,10);
//var id = Math.floor(Math.random() * 100000000);


var ldp = {
  hostname: ldpc.split('/')[2],
  rejectUnauthorized: false,
  key:    fs.readFileSync('/home/melvin/s/webid.pem'),
  cert:   fs.readFileSync('/home/melvin/s/webid.pem'),
  port:     443,
  method:   'POST',
  headers:  {'Content-Type': 'text/turtle'}
};



function toTurtle(webid, avatar, name, text) {
  // create turtle
  var turtle = '';
  turtle += '<#author> ';
  turtle += 'a <http://xmlns.com/foaf/0.1/#Person> ; ';
  turtle += '   <http://www.w3.org/2002/07/owl#sameAs> <' + webid + '> ; ';
  turtle += '    <http://xmlns.com/foaf/0.1/depiction> <'+ avatar +'> ; ';
  turtle += '    <http://xmlns.com/foaf/0.1/name> "'+ name +'" . ';

  turtle += '<#this> ';
  turtle += '    <http://purl.org/dc/terms/created> "'+ new Date().toISOString() +'"^^<http://www.w3.org/2001/XMLSchema#dateTime> ; ';
  turtle += '    <http://purl.org/dc/terms/creator> <#author> ; ';
  turtle += '    <http://rdfs.org/sioc/ns#content> """'+ text +'""" ; ';
  turtle += '    a <http://rdfs.org/sioc/ns#Post> ; ';
  turtle += '    <http://www.w3.org/ns/mblog#author> <#author> . ';

  return turtle;
}



// create turtle
var turtle  = toTurtle(webid, avatar, name, text);

console.log(turtle);

// put file to ldp
ldp.path = path + today + '/' ;
var put = https.request(ldp, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers, null, 2));
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

put.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

put.write(turtle);
put.end();

/*
// put meta file
ldp.path = path + today + '/' + '/,meta';
ldp.method = 'PUT';
var put = https.request(ldp, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers, null, 2));
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

put.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

put.write('<> <http://www.w3.org/ns/posix/stat#mtime> "'+ Math.floor(Date.now() / 1000) +'" . ');
put.end();
*/
