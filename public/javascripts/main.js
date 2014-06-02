angular.module('deploymentAppServices', []).
factory('Fetch', function() {
  return function() {
    return {
      myService: 'a'
    };
  };
});

var myApp = angular.module('deploymentApp', ['deploymentAppServices']);

var isActive = true;
var onChangeCallback = null;
window.document.addEventListener('visibilitychange', function(){
  isActive = !document.hidden;
  if (onChangeCallback) {
    onChangeCallback(isActive);
  }
});

myApp.controller('MainCtrl', function($scope, $http, $timeout, Fetch) {
  $scope.content = {};
  $scope.fetching = {};
  $scope.fetchingActive = {};

  $timeout(function fetchLogs() {
    $http.get('/logs').success(function(logs) {
      logs.sort();
      logs.reverse();
      $scope.logFiles = logs;
    });
    if (isActive) {
      $timeout(fetchLogs, 3000);
    }
  });

  $scope.fetchLog = function(logFile) {
    $scope.fetching[logFile] = true;

    if ($scope.fetchingActive[logFile]) {
      $scope.fetchingActive[logFile] = false;
    } else {
      $scope.fetchingActive[logFile] = true;
      $timeout(function fetchLog() {
        $http.get('/logs/' + logFile).success(function(data) {
          $scope.fetching[logFile] = false;
          $scope.content[logFile] = data;
        });
        if (isActive && $scope.fetchingActive[logFile]) {
          $timeout(fetchLog, 700);
        }
      }, 500);
    }
  };

  var currentId = null;
  $scope.deployOn = function(server) {
    var removeMsgs = function(id) {
      currentId = id;
      $timeout(function() {
        if (id === currentId) {
          $scope.msg = false;
          $scope.errorMsg = false;
        }
      }, 5000);
    };

    $http.post('/deploy/' + server).success(function() {
      $scope.msg = "Deployment on " + server + " is scheduled.";
      removeMsgs();
    }).error(function() {
      $scope.errorMsg = 'Error during deployment on ' + server;
      removeMsgs();
    });
  };
});
