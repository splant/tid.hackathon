var stories  = [];
var currentRound = null;

module.exports = {

    create : function(io){

        function getRoomStatus() {
            var room = {
                people : [], 
                stories: stories, 
                currentRound: null 
            };

            var clients = io.sockets.adapter.rooms["123"];

            for (var clientId in clients ) {
                var socket = io.sockets.connected[clientId];//Do whatever you want with this
                room.people.push({"name": socket.name, "color": socket.color});
            }

            return room;
        };

        function endRound() {
            console.log('ending round');
            io.sockets.emit('endedround', currentRound);
            currentRound = null;
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
                socket.broadcast.emit("joined", {name:socket.name,color:socket.color});
                console.log("Hello from "+data.name);
            });

            socket.on('disconnect', function() {
                console.log(socket.name + " disconnected");
                socket.broadcast.emit("exited",{name:socket.name,color:socket.color});
            });

            socket.on('createstory', function(data){
                stories.push({name: data.name});
                socket.broadcast.emit("createdstory",{name: data.name});
            });

            socket.on('startround', function(data) {
                var story = data.name;
                var startTime = new Date();

                currentRound = {
                    story: story,
                    startTime: startTime,
                    votes: {}
                };
                console.log('Started round');
                socket.broadcast.emit('startedround', currentRound);

                setTimeout(endRound, 10000); 
            });

            socket.on('vote', function(data) {
                var estimate = data.estimate;
                console.log('Received vote from '+socket.name+': '+estimate);
                if (currentRound) {
                    currentRound.votes[socket.name] = estimate;
                    
                    socket.broadcast.emit('voted', {
                        name: socket.name,
                        estimate: estimate
                    });
                }
            })

        });
    }
}


