$(document).foundation();


(function(){

  var socket = io.connect('http://127.0.0.1:3000/');

  var names = ["Maria", "Dan", "Alex", "Simon", "John"];
  var colors = ["red", "blue", "green", "orange", "purple"];

  var app = angular.module("planningPokerApp", [])

  var getRandomUser = function(){
    return {
      "name" : names[Math.floor(Math.random() * 5)],
      "color" : colors[Math.floor(Math.random() * 5)],
    }
  }

  var everythingController = app.controller("everythingController", function(){
  })

  var usersController = app.controller("usersController", function($scope, $http){

    $scope.users = []

    var newUser = getRandomUser();
    $scope.users.push(newUser);
    socket.emit("join", newUser);

  })

  var votingWidgetController = app.controller("votingWidgetController", function($scope){

    $scope.onVote = function(number){

    }
  })

  var votingWidget = app.directive("votingWidget", function(){

    return {
      "templateUrl" : "../templates/votingWidget.html"
    };
  })

})();
