$(document).foundation();


(function(){

  // var socket = io.connect('http://localhost:3000/');
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

  var everythingController = app.controller("everythingController", function($scope, $http){
    $scope.stories = [];

    $scope.stories.addStory = function(data) {
      socket.emit("createstory", {name: data}, function(err){
        //if error just do not add to list
      });
    }

    socket.on('createdstory', function(){

    });
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
      for (i = 0; i < users.length; i++) {
        if(users[i].name === user.name && users[i].id === user.id) {
          users.splice(i, 1)
          $scope.$apply();
        }
      }
		});

  })

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

  var roundController = app.controller("roundController", function($scope){
    $scope.roundStartedClicked = function(){
      socket.emit("startround", { name : "A story!" }, function(error){
        if(error){
          $("#room-updates").text("Round Error!")
        } else {
          $("#room-updates").text("Round Started!")
        }
      });

    }

    socket.on("endedround", function(roundResults){
      $("#room-updates").text("Round ended: " + JSON.stringify(roundResults));
      $(".user-tile").css("border", "none")
		});

    socket.on("voted", function(voteResult){
      $("#user-tile-" + voteResult.id).css("border", "3px solid black")
		});

    socket.on("startedround", function(voteResult){
      $("#room-updates").text("Round Started!")
    });
  })


})();
