$(document).foundation();


(function(){

  var app = angular.module("planningPokerApp", [])

  var everythingController = app.controller("everythingController", function(){
  })

  var usersController = app.controller("usersController", function($scope){
    $scope.users = [{
      "id" : "1",
      "name" : "Bob",
      "color" : "green"
    },{
      "id" : "2",
      "name" : "Mary",
      "color" : "orange"
    }
    ]
  })

})();
