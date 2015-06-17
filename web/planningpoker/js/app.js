$(document).foundation();


(function(){

  var names = ["Maria", "Dan", "Alex", "Simon", "John"];
  var colors = ["Red", "Blue", "Green", "Orange", "Brown", "Pink", "Purple", "Yellow"];

  var app = angular.module("planningPokerApp", [])

  var getRandomUser = function(){
    return {
      "name" : names[Math.floor(Math.random() * 5)],
      "color" : colors[Math.floor(Math.random() * 8)],
    }
  }

  var everythingController = app.controller("everythingController", function(){
  })

  var usersController = app.controller("usersController", function($scope, $http){

    $http.post('/someUrl', {msg:'hello word!'})
         .success(function(data, status, headers, config) {
           // this callback will be called asynchronously
           // when the response is available
         })
         .error(function(data, status, headers, config) {
           // called asynchronously if an error occurs
           // or server returns response with an error status.
           //alert(data);
         });


    $scope.users = [{
      "id" : "1",
      "name" : "Bob",
      "color" : "green"
    },{
      "id" : "2",
      "name" : "Mary",
      "color" : "orange"
    }]

    $scope.users.push(getRandomUser());
  })

})();
