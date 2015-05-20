// requires
var https = require('https');
var fs = require('fs');

var file = process.argv[2] || './inferno-09.txt';
var datadir = "./data/";

//var ldpc = process.argv[3] || "https://artes.rww.io/dante/inferno-08";
var ldpc = process.argv[3] || "https://localhost/artes/dante/inferno-08";

var str = fs.readFileSync(file);

var verses = str.toString().split(/\n\n/);
var line = 1;

function padToThree(number) {
  if (number<=9) { number = ("0"+number); }
  if (number<=99) { number = ("0"+number); }
  return number;
}

var count = 0;
for (var i=0; i<verses.length; i++, count++) {
  turtle = '<#'+ padToThree(1+3*i)+'> <http://purl.org/ontology/bibo/#content> """' + verses[i] + '""" . ';
  turtle += "\n";
  console.log(turtle);
  fs.writeFileSync(datadir + i + '.ttl', 'INSERT DATA { ' + turtle + ' } ');
  //patch(turtle);
  //if (count === 2) continue;
}

function patch(data) {
  var ldp = {
    hostname: ldpc.split('/')[2],
    rejectUnauthorized: false,
    key:    fs.readFileSync('/home/melvin/s/webid.pem'),
    cert:   fs.readFileSync('/home/melvin/s/webid.pem'),
    port:     443,
    method:   'GET',
    headers:  {'Content-Type': 'application/sparql-update'}
  };


  // put file to ldp
  var arr = ldpc.split('/');
  ldp.path = arr[arr.length-2] + '/' + arr[arr.length-1];
  console.log(ldp.path);
  ldp.path = 'artes/dante/inferno-08'
  console.log(ldp);
  var put = https.request(ldp, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  put.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  var patch = 'INSERT DATA { ' + turtle + ' } ';
  console.log(patch);
  put.write(patch);
  put.end();

}
