// requires
var https = require('https');
var fs    = require('fs');

url = process.argv[2] || 'https://inartes.databox.me/Public/dante/inferno-08';


var options = {
  hostname: url.split('/')[2],
  //key:    fs.readFileSync('/home/melvin/s/webid.pem'),
  //cert:   fs.readFileSync('/home/melvin/s/webid.pem'),
  port:     443,
  method:   'GET',
  headers:  {'Accept': 'application/json'},
  path: '/' + url.split(['/']).slice(3).join('/')
};

var bookmarkfile = '/var/www/util/line.txt';

//console.error(options);

var req = https.request(options, function(res) {
  res.setEncoding('utf8');
  var body = '';
  console.error('STATUS: ' + res.statusCode);
  console.error('HEADERS: ' + JSON.stringify(res.headers));
  res.on('data', function (chunk) {
    body += chunk;
  });

  res.on('end', function(){
    var j = JSON.parse(body);
    //console.log(body);
    //console.log(j);

    function getLineNumber() {
      return parseInt(fs.readFileSync(bookmarkfile));
    }
    function saveLineNumber(line) {
      fs.writeFileSync(bookmarkfile, line);
    }
    function getIdFromLine(line) {
      var ret = parseInt(line);
      if (ret<10) return  '#00' + line;
      if (ret<100) return  '#0' + line;
      return '#'+ line;
    }
    function lineExists(id) {
      if (j[id]) {
        return true;
      } else {
        return false;
      }
    }
    function getNextLine(line) {
      return parseInt(line) + 3;
    }
    var line = getLineNumber();
    var id = getIdFromLine(line);
    if (!lineExists(id)) {
      console.error('line : ' + id + ' does not exist!!');
      process.exit(-1);
    }
    console.log(j[id]['http://purl.org/ontology/bibo/#content'][0] .value);

    line = getNextLine(line);
    id = getIdFromLine(line);
    if (!lineExists(id)) {
      console.error('line : ' + line + ' does not exist!');
      process.exit(-1);
    }
    saveLineNumber(line);

  });

});

req.on('error', function(e){

  console.log('error ' + e);

});

req.end();
