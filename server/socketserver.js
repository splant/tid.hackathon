var stories  = [];
var currentRound = null;
var currentRoundTimer = null;

module.exports = {

    create : function(io){

        function userInfo(socket) {
            return {
                id: socket.id,
                name: socket.name,
                color: socket.color
            }
        }

        function getPeople() {
            var people = [];
            var clients = io.sockets.adapter.rooms["123"];

            for (var clientId in clients ) {
                var socket = io.sockets.connected[clientId];//Do whatever you want with this
                people.push(userInfo(socket));
            }
            return people;
        }

        function getRoomStatus() {
            return {
                people : getPeople(),
                stories: stories, 
                currentRound: null 
            };
        };

        function endRound() {
            console.log('ending round');
            io.sockets.emit('endedround', currentRound);
            currentRound = null;
        }

        function hasStory(name) {
            for (var i = 0; i < stories.length; i++) {
                var story = stories[i];
                if (story.name == name) {
                    return true;
                }
            }
            return false;
        }

        io.on("connection", function(socket) {

            socket.join("123");

            console.log("A user connected");
            socket.emit('welcome', {name: 'a random name'});

            socket.on('join', function(data) {

                // name our socket for future events
                socket.name = data.name;
                socket.color = data.color;

                // send room status to sender
                socket.emit("roomstatus", getRoomStatus());
                socket.broadcast.emit("joined", userInfo(socket));
                console.log("Hello from "+data.name);
            });

            socket.on('disconnect', function() {
                console.log(socket.name + " disconnected");
                socket.broadcast.emit("exited",userInfo(socket));
            });

            socket.on('createstory', function(data, error){

                if (hasStory(data.name)) {
                    console.log('Failed to create story (duplicate name)');
                    error(true);
                } else {
                    console.log('Created story: '+data.name);
                    stories.push({name: data.name});
                    socket.broadcast.emit("createdstory",{name: data.name});
                    error(false);
                }
            });

            socket.on('startround', function(data, error) {
                if (currentRound != null) {
                    console.log("Could not start round - Round in progress");
                    error(true);
                } else {
                    console.log('Started round');

                    var story = data.name;
                    var startTime = new Date();

                    currentRound = {
                        story: story,
                        startTime: startTime,
                        votes: {}
                    };
                    
                    socket.broadcast.emit('startedround', currentRound);

                    currentRoundTimer = setTimeout(endRound, 30000);
                    error(false);
                }
            });

            socket.on('vote', function(data) {
                var estimate = data.estimate;
                console.log('Received vote from '+socket.name+': '+estimate);
                if (currentRound) {
                    currentRound.votes[socket.id] = estimate;

                    socket.broadcast.emit('voted', userInfo(socket));

                    if(everyoneVoted()) {
                        clearTimeout(currentRoundTimer);
                        endRound();
                    }
                }
            })

            function everyoneVoted() {
                return getPeople().length == Object.keys(currentRound.votes).length;
            }

        });
    }
}


