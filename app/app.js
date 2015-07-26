var f,g;
var db;


var BIBO  = $rdf.Namespace("http://purl.org/ontology/bibo/#");
var CHAT  = $rdf.Namespace("https://ns.rww.io/chat#");
var CURR  = $rdf.Namespace("https://w3id.org/cc#");
var DCT   = $rdf.Namespace("http://purl.org/dc/terms/");
var FACE  = $rdf.Namespace("https://graph.facebook.com/schema/~/");
var FOAF  = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var LIKE  = $rdf.Namespace("http://ontologi.es/like#");
var LDP   = $rdf.Namespace("http://www.w3.org/ns/ldp#");
var MBLOG = $rdf.Namespace("http://www.w3.org/ns/mblog#");
var OWL   = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
var PIM   = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
var RDF   = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var RDFS  = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var SIOC  = $rdf.Namespace("http://rdfs.org/sioc/ns#");
var SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/app#");
var URN   = $rdf.Namespace("urn:");

var AUTHENDPOINT = "https://databox.me/";
var PROXY = "https://rww.io/proxy.php?uri={uri}";
var TIMEOUT = 5000;
var DEBUG = true;

var scope = {};
var gg;

$rdf.Fetcher.crossSiteProxyTemplate=PROXY;

var App = angular.module('myApp', [
  'lumx'
]);

App.config(function($locationProvider) {
  $locationProvider
    .html5Mode({ enabled: true, requireBase: false });
});

App.controller('Main', function($scope, $http, $location, $timeout, $sce, LxNotificationService, LxProgressService, LxDialogService) {

  // save app configuration if it's the first time the app runs
  $scope.initApp = function() {
    $scope.init();
  };

  $scope.TLSlogin = function() {
    $scope.loginTLSButtonText = 'Logging in...';
    $http({
      method: 'HEAD',
      url: AUTHENDPOINT,
      withCredentials: true
    }).success(function(data, status, headers) {
      // add dir to local list
      var user = headers('User');
      if (user && user.length > 0 && user.slice(0,4) == 'http') {
        LxNotificationService.success('Login Successful!');
        $scope.loggedIn = true;
        $scope.user = user;
      } else {
        LxNotificationService.error('WebID-TLS authentication failed.');
        console.log('WebID-TLS authentication failed.');
      }
      $scope.loginTLSButtonText = 'Login';
    }).error(function(data, status, headers) {
      LxNotificationService.error('Could not connect to auth server: HTTP '+status);
      console.log('Could not connect to auth server: HTTP '+status);
      $scope.loginTLSButtonText = 'Login';
    });
  };


  $scope.setVideo = function (uri) {
    $scope.video = uri;
    $('#video').empty().append('<iframe width="420" height="315" src="'+uri+'"></iframe>');
  };

  $scope.openDialog = function(elem, reset) {
      if (reset) {
          $scope.resetContact();
      }
      LxDialogService.open(elem);
      $(document).keyup(function(e) {
        if (e.keyCode===27) {
          LxDialogService.close(elem);
        }
      });
  };

  $scope.logout = function() {
    $scope.init();
    LxNotificationService.success('Logout Successful!');
  };

  $scope.next = function() {
    if ($scope.verse < $scope.verses.length-1) {
      $scope.verse++;
      $scope.line += 3;
      $scope.render();
    } else {
      console.log('load next chapter');
      $scope.chapter = parseInt($scope.contentURI.substr(-2));
      $scope.chapter += 1;
      var stem = $scope.contentURI.substr(0, $scope.contentURI.length - 2);

      if ($scope.chapter < 10) {
        stem += '0';
      }
      $scope.contentURI = stem + $scope.chapter;

      $scope.verse = 0;
      $scope.line = 1;
      f.nowOrWhenFetched($scope.contentURI, undefined, function(ok, body) {
        $scope.render();
      });
    }
  };

  $scope.render = function() {
    $scope.verses = g.statementsMatching(undefined, BIBO('content'), undefined, $rdf.sym($scope.contentURI) );
    if ($scope.verses.length > $scope.verse) {
      $scope.artes = $scope.verses[$scope.verse].object.value;
      $location.search('contentURI', $scope.verses[$scope.verse].subject.value);
    }
    console.log($scope.artes);
    $scope.$apply();
  };

  // set init variables
  $scope.init = function() {

    $scope.verse = 0;
    $scope.artes = 'loading...';
    $scope.chapter = 1;
    $scope.line = 1;

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

    var contentURI = 'https://inartes.databox.me/Public/dante/inferno-01';
    if ($location.search().contentURI) {
      contentURI = $location.search().contentURI.split('#')[0];
      if ($location.search().contentURI.split('#').length > 0) {
        var line = $location.search().contentURI.split('#')[1];
        if (parseInt(line)) {
          $scope.line = parseInt(line);
          $scope.verse = (parseInt(line)-1)/3;
        }
      }
    }
    $scope.contentURI = contentURI;

    f.nowOrWhenFetched(contentURI, undefined, function(ok, body) {
      $scope.render();
    });

  };

  $scope.initApp();

});
