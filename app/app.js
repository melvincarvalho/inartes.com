/*
* Set up globals
*/
var f,g;
var template;

var BIBO  = $rdf.Namespace("http://purl.org/ontology/bibo/#");
var CHAT  = $rdf.Namespace("https://ns.rww.io/chat#");
var CURR  = $rdf.Namespace("https://w3id.org/cc#");
var DCT   = $rdf.Namespace("http://purl.org/dc/terms/");
var FACE  = $rdf.Namespace("https://graph.facebook.com/schema/~/");
var FOAF  = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var LIKE  = $rdf.Namespace("http://ontologi.es/like#");
var LINK  = $rdf.Namespace("http://www.w3.org/2007/ont/link#");
var LDP   = $rdf.Namespace("http://www.w3.org/ns/ldp#");
var MBLOG = $rdf.Namespace("http://www.w3.org/ns/mblog#");
var OWL   = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
var PIM   = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
var RDF   = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var RDFS  = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var SIOC  = $rdf.Namespace("http://rdfs.org/sioc/ns#");
var SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/app#");
var URN   = $rdf.Namespace("urn:");
var XHV   = $rdf.Namespace("http://www.w3.org/1999/xhtml/vocab#");


var AUTHENDPOINT = "https://databox.me/";
var PROXY = "https://rww.io/proxy.php?uri={uri}";
var TIMEOUT = 2000;
var DEBUG = true;
var defaultContentURI = 'https://inartes.databox.me/Public/dante/inferno-01#001';

$rdf.Fetcher.crossSiteProxyTemplate=PROXY;


/**
* The app an angular module
*/
var App = angular.module('myApp', [
  'lumx',
  'ngAudio'
]);

/**
* The app config
*/
App.config(function($locationProvider) {
  $locationProvider
  .html5Mode({ enabled: true, requireBase: false });
});

/**
* The App controller
*/
App.controller('Main', function($scope, $http, $location, $timeout, $sce, LxNotificationService, LxProgressService, LxDialogService, ngAudio) {

  /*
  * INIT functions
  */

  /**
  * Initializes the app
  */
  $scope.initApp = function() {
    $scope.init();
  };

  /**
  * Initialize the app
  */
  $scope.init = function() {

    template = $scope;
    $scope.verse = 0;
    $scope.artes = 'loading...';
    $scope.chapter = 1;
    $scope.line = 1;

    $scope.defaultSound = 'audio/button-3.mp3';
    $scope.audio = ngAudio.load($scope.defaultSound);

    // start in memory DB
    g = $rdf.graph();
    f = $rdf.fetcher(g);
    // add CORS proxy
    var PROXY      = "https://data.fm/proxy?uri={uri}";
    var AUTH_PROXY = "https://rww.io/auth-proxy?uri=";
    //$rdf.Fetcher.crossSiteProxyTemplate=PROXY;
    var kb         = $rdf.graph();
    var fetcher    = $rdf.fetcher(kb);


    $scope.initialized = true;
    $scope.loggedIn = false;
    $scope.loginTLSButtonText = "Login";
    // display elements object

    $scope.contentURI = $scope.getContentURI();
    $location.search('contentURI', $scope.contentURI);

    f.nowOrWhenFetched($scope.contentURI.split('#')[0], undefined, function(ok, body) {
      $scope.render();
    });

  };


  /*
  * AUTH functions
  */

  /**
  * TLS login
  */
  $scope.TLSlogin = function() {
    $scope.loginTLSButtonText = 'Logging in...';
    console.log('logging in');
    $http({
      method: 'HEAD',
      url: AUTHENDPOINT,
      withCredentials: true
    }).success(function(data, status, headers) {
      // add dir to local list
      var user = headers('User');
      if (user && user.length > 0 && user.slice(0,4) == 'http') {
        //LxNotificationService.success('Login Successful!');
        $scope.loggedIn = true;
        $scope.user = user;
        console.log('success logged in a ' + user);
      } else {
        //LxNotificationService.error('WebID-TLS authentication failed.');
        console.log('WebID-TLS authentication failed.');
      }
      $scope.loginTLSButtonText = 'Login';
    }).error(function(data, status, headers) {
      LxNotificationService.error('Could not connect to auth server: HTTP '+status);
      console.log('Could not connect to auth server: HTTP '+status);
      $scope.loginTLSButtonText = 'Login';
    });
  };

  /**
  * Logout
  */
  $scope.logout = function() {
    $scope.init();
    LxNotificationService.success('Logout Successful!');
  };


  /*
  * HELPER functions
  */

  /**
  * Gets number of lines from a string
  * @param {String} the content
  * @return {Number} number of lines
  */
  $scope.getNumLines = function(artes) {
    ret = 0;

    if (!artes) artes = $scope.artes;
    var count = artes.split("\n").length;
    ret += count;

    return ret;
  };

  /**
  * Gets the next chapter from a document using rel=next
  * @return {String} The next chapter
  */
  $scope.getNextChapter = function() {
    var n = g.statementsMatching($rdf.sym($scope.contentURI.split('#')[0]), XHV('next'));
    if (n.length > 0) {
      return n[0].object.value;
    }

    var chapter = parseInt($scope.contentURI.substr(-2));
    chapter += 1;
    var stem = $scope.contentURI.substr(0, $scope.contentURI.length - 2);

    if ($scope.chapter < 10) {
      stem += '0';
    }

    return stem + chapter;
  };

  /**
  * Gets all fragments from a URI
  * @param {String} uri
  * @return {Array} fragments All known fragments from that uri
  */
  $scope.getFragments = function(uri) {
    if (!uri) {
      console.error('uri is required');
    }

    var res = g.statementsMatching( null, null, null, $rdf.sym(uri.split('#')[0]) );

    if (!res || !res.length) return null;

    var ret = [];

    for (var i=0; i<res.length; i++) {
      if (res[i].subject && res[i].subject.value && res[i].subject.value.split('#').length > 1 ) {
        var subject = res[i].subject.value;
        var fragment = subject.substring(subject.indexOf('#') + 1);
        if (ret.indexOf(fragment) === -1) {
          ret.push(fragment);
        }
      }
    }

    // sort numerically or alphabetically
    ret = ret.sort(function(a,b){
      if ( !isNaN(a) && !isNaN(b) ) {
        return a - b;
      } else {
        return a < b;
      }
    });

    return ret;

  };

  /**
  * Gets the fragment
  * @param {String} the uri to get a fragment from
  * @return {String} the fragment
  */
  $scope.getFragment = function(uri) {
    if (!uri) {
      console.error('uri is required');
      return;
    }

    if (uri.split('#').length === 1) return;

    var fragment = uri.substring(uri.indexOf('#') + 1);

    return fragment;
  };

  /**
  * Gets the next line number
  * @param {String} uri
  * @return {Number} The verse number
  */
  $scope.getVerseNumber = function(uri) {
    if (!uri) {
      console.error('uri is required');
      return;
    }

    var fragments = $scope.getFragments(uri);
    if (!fragments || !fragments.length) return 1;

    var fragment = $scope.getFragment(uri);

    var index = fragments.indexOf(fragment);
    if ( index !== -1 ) {
      return index + 1;
    }
  };

  /**
  * Gets the next line number
  * @param {String} uri
  * @return {Number} The verse number
  */
  $scope.getLineNumber = function(uri) {
    if (!uri) {
      console.error('uri is required');
      return;
    }

    var fragment = $scope.getFragment(uri);

    if (!isNaN(parseInt(fragment))) {
      return parseInt(fragment);
    }

  };

  /**
  * Gets artes
  * @param {String} uri
  * @return {String} The content
  */
  $scope.getArtes = function(uri) {
    if (!uri) {
      console.error('uri is required');
      return;
    }

    var artes = g.any($rdf.sym(uri), BIBO('content'));
    if (artes && artes.value) {
      return artes.value;
    }

  };

  /**
  * Gets chapter
  * @param {String} uri
  * @return {String} The chapter
  */
  $scope.getChapter = function(uri) {
    if (!uri) {
      console.error('uri is required');
      return;
    }

    var chapter = g.any($rdf.sym(uri), BIBO('chapter'));
    if (chapter && chapter.value) {
      return chapter.value;
    }

    var url = $scope.contentURI.split('#')[0];
    var ch = url.substr(-2);
    if (!isNaN(parseInt(ch))) {
      return parseInt(ch);
    }

  };

  /**
  * Gets title
  * @param {String} uri
  * @return {String} The title
  */
  $scope.getTitle = function(uri) {
    if (!uri) {
      console.error('uri is required');
      return;
    }

    var title = g.any($rdf.sym(uri.split('#')[0]), DCT('title'), null, $rdf.sym(uri.split('#')[0]));
    if (title && title.value) {
      return title.value;
    }

    var url = $scope.contentURI.split('#')[0];
    var slashes = url.split('/');
    var last = slashes[slashes.length-1];
    if (last) {
      if (last.indexOf('inferno') === 0) return "Dante's Inferno";
      return last;
    }

  };

  /**
  * Gets the next line in a page or flip to next page
  */
  $scope.next = function() {
    var fragments = $scope.getFragments($scope.contentURI);

    if ($scope.verse < fragments.length) {
      $scope.verse++;
      $scope.line += $scope.getNumLines($scope.artes);
      $scope.contentURI = $scope.contentURI.split('#')[0] + '#' + fragments[$scope.verse-1];
      $location.search('contentURI', $scope.contentURI);
      $scope.render();
    } else {
      console.log('load next chapter');
      var next = $scope.getNextChapter();


      f.nowOrWhenFetched(next, undefined, function(ok, body) {
        var error = g.statementsMatching($rdf.sym(next), LINK('error'));

        if (error.length>0) {
          // process 402 or 403
          var c = confirm('HTTP 402, payment required!\nFirst two chapters are free.\nNext chapter costs 1 bit.\nWould you like to buy access?');
          if (c) {
            $scope.TLSlogin();
            setTimeout(pay, 1000);
          }
          return;
        }

        $scope.verse = 1;
        $scope.line = 1;
        $scope.chapter++;
        var fragments = $scope.getFragments(next);
        $scope.contentURI = next + '#' + fragments[0];
        $location.search('contentURI', $scope.contentURI);

        $scope.render();
      });


    }
  };

  /**
  * Gets content URI or default
  * @return {String} The content URI or default
  */
  $scope.getContentURI = function() {
    var contentURI;
    if ($location.search().contentURI) {
      contentURI = $location.search().contentURI;
    } else {
      contentURI = defaultContentURI;
    }
    return contentURI;
  };

  /*
  * PAYMENT functions
  */

  /**
  * Pay when required
  */
  function pay() {
    if (!$scope.user) alert('Please log in first.');
    alert('paying ' + $scope.user);


    var bot = 'https://inartes.databox.me/profile/card#me';

    var wc = '<#this>  a <https://w3id.org/cc#Credit> ;\n';
    wc += '  <https://w3id.org/cc#source> \n    <' + $scope.user + '> ;\n';
    wc += '  <https://w3id.org/cc#destination> \n    <' + bot + '> ;\n';
    wc += '  <https://w3id.org/cc#amount> "' + 1 + '" ;\n';
    wc += '  <https://w3id.org/cc#currency> \n    <https://w3id.org/cc#bit> .\n';


    var hash = CryptoJS.SHA256($scope.user).toString();

    function postFile(file, data) {
      xhr = new XMLHttpRequest();
      xhr.open('POST', file, false);
      xhr.setRequestHeader('Content-Type', 'text/turtle; charset=UTF-8');
      xhr.send(data);
    }

    postFile('https://gitpay.databox.me/Public/.wallet/github.com/melvincarvalho/inartes.com/inbox/' + hash + '/', wc);
    console.log(wc);
  }

  /*
  * RENDER functions
  */

  /**
  * Renders the screen
  */
  $scope.render = function() {
    // get content URI
    $scope.contentURI = $scope.getContentURI();

    // get and render verse number
    $scope.verse = $scope.getVerseNumber($scope.contentURI);

    // get and render line number
    $scope.line = $scope.getLineNumber($scope.contentURI);

    // get and render content
    $scope.artes = $scope.getArtes($scope.contentURI);

    // get and render chapter
    $scope.chapter = $scope.getChapter($scope.contentURI);

    // get and render title
    $scope.title = $scope.getTitle($scope.contentURI);

    // render if necessary
    $scope.$apply();
  };

  /**
  * Checks for keypresses
  */
  $scope.keydown = function(event) {
    console.log(event.which);
    if (event.which === 39) {
      $scope.next();
    }
  };

  /*
  * MAIN
  */
  $scope.initApp();

});
