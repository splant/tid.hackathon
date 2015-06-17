$(document).foundation();


(function(){

  //var socket = io.connect('http://localhost:3000/');
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

  var roundService = app.factory('round', function() {
    var service = {
      currentRound: null
    };

    return service;
  })

  var everythingController = app.controller("everythingController", function($scope, $http){
    $scope.stories = [];

    $scope.stories.addStory = function(data) {
      socket.emit("createstory", {name: data}, function(err){
        if(err){
          $("#room-updates").text("Story creation error!")
        } else {
          $("#room-updates").text("Story: " + data + " was created!")
        }
      });
    }

    socket.on('createdstory', function(){

    });
  })

  var usersController = app.controller("usersController", 
    ['$scope', '$http', 'round', function($scope, $http, round){

    $scope.users = []

    var newUser = getRandomUser();
    socket.emit("join", newUser);

    socket.on('roomstatus', function(room){
      for (i = 0; i < room.people.length; i++) {
        $scope.users.push(room.people[i]);
        $scope.$apply();
      }
      round.currentRound = room.currentRound;
      if (round.currentRound != null) {
        var startTime = round.currentRound.startTime;
        round.currentRound.startTime = new Date(startTime);
      }
      console.log(room)
      $scope.$apply();
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
      for (i = 0; i < users.length; i++) {
        if(users[i].name === user.name && users[i].id === user.id) {
          users.splice(i, 1)
          $scope.$apply();
        }
      }
		});

  }])

  var votingWidgetController = app.controller("votingWidgetController", function($scope){

    $scope.onVote = function(number){
      $("#room-updates").text("Congratulations!!! You voted for: " + number + "!?");
      socket.emit("vote", { estimate : number });
    }
  })

  var votingWidget = app.directive("votingWidget", function(){

    return {
      scope : {
        onButtonClicked : "&"
      },
      link : function(scope, element, attrs, controller){
        scope.buttonClicked = function (num) {
          scope.onButtonClicked()(num);
        }
      },
      templateUrl : "../templates/votingWidget.html"
    };
  })

  var countdownWidget = app.directive("countdownWidget", ['$interval', function($interval) {
    
    function link(scope, element, attrs) {

      function updateTimer() {
        var now = new Date();
        var difference = now - scope.start;
        var timeRemaining = Math.round((30000 - difference)/1000);
        
        var countdownString = '0:';

        if (timeRemaining < 10) {
          countdownString += '0';
        }

        countdownString += timeRemaining;

        element.text(countdownString);
      }

      element.on('$destroy', function() {
        $interval.cancel(timeout);
      });

      timeout = $interval(function() {
        updateTimer();
      }, 1000);

      updateTimer();
    }

    return {
      scope: {
        start: '='
      },
      link: link
    };
  }])

  var roundController = app.controller("roundController", 
    ['$scope', 'round', function($scope, round){

    $scope.round = round;

    $scope.isRoundActive = function() {
      return $scope.round.currentRound != null;
    }

    $scope.roundStartedClicked = function(data){
      socket.emit("startround", { name : data }, function(error){
        if(error){
          $("#room-updates").text("Round Error!")
        } else {
          $("#room-updates").text("Round Started for story " + data)
          $scope.round.currentRound = {
            story: data,
            startTime: new Date(),
            votes: {}
          };
          $scope.$apply();
        }
      });

    }

    socket.on("endedround", function(roundResults){
      $("#room-updates").text("Round ended: " + JSON.stringify(roundResults));
      $(".user-tile").css("border", "none")
      $scope.round.currentRound = null;
      $scope.$apply();
		});

    socket.on("voted", function(voteResult){
      $("#user-tile-" + voteResult.id).css("border", "3px solid black")
		});

    socket.on("startedround", function(round){
      $("#room-updates").text("Round Started!")
      round.startTime = new Date(round.startTime);
      $scope.round.currentRound = round;
      $scope.$apply();
    });
  }])


})();
