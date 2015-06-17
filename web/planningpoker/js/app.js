$(document).foundation();


(function(){

  var socket = io.connect('http://SI3VWUK1UMU002.pre-prod.skyscanner.local:3000/');

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
    socket.emit("join", newUser);

    socket.on('roomstatus', function(room){
      for (i = 0; i < room.people.length; i++) {
        $scope.users.push(room.people[i]);
        $scope.$apply();
      }
      console.log(room)
    });

		socket.on('joined',function(user){
			console.log("User "+user.name+" just joined the room with colour "+ user.color);
			console.log(user.color);
      $scope.users.push(user);
      $scope.$apply();
		});

    socket.on("exited", function(user){
      console.log("User "+user.name+" just left the room.");
      var users = $scope.users;
      for (i = 0; i < room.people.length; i++) {
        if(users[i].name === user.name && users[i].color === user.color) {
          users.splice(i, 1)
          $scope.$apply();
        }
      }
		});

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
