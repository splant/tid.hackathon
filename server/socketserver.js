var stories  = [];
var room ={ stories: stories};

module.exports = {

    create : function(io){

        function getRoomStatus() {

            room.people = [];

            var clients = io.sockets.adapter.rooms["123"];

            for (var clientId in clients ) {
                var socket = io.sockets.connected[clientId];//Do whatever you want with this
                room.people.push({"name": socket.name, "color": socket.color});
            }

            return room;
        };

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
                stories.push({name: data.storyname});
                socket.broadcast.emit("createdstory",{name: data.storyname});
            });
        });
    }
}


