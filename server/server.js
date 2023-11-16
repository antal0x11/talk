import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer((req,res) => {
	res.end("hey");
});
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173"
	}
});

let totalClients = 0;

const activeUsers = new Map();

io.on("connection", (socket) => {
	totalClients++;
	console.log(`[+] client connected : ${socket.id}`);
	socket.broadcast.emit("client_status", {clients_available : totalClients});

	socket.broadcast.emit("active_users", serializeMapUsers(activeUsers));
	socket.emit("active_users", serializeMapUsers(activeUsers));

	socket.on("disconnect", () => {
		console.log(`[+] client disconnected : ${socket.id}`);
		totalClients--;
		
		activeUsers.delete(socket.id);
		socket.broadcast.emit("active_users", serializeMapUsers(activeUsers));

		socket.broadcast.emit("client_status", {clients_available : totalClients});
	});

	socket.on("message", (msg) => {
		socket.broadcast.emit("message", msg);
	});

	socket.on("add_user", (userObj) => {
		activeUsers.set(socket.id,userObj.name);

		const activeUsersObj = serializeMapUsers(activeUsers);

		socket.emit("active_users", activeUsersObj);
		socket.broadcast.emit("active_users", activeUsersObj);
	})

	socket.emit("server_response", new serverStats("primary",socket.id,totalClients));

});

httpServer.listen(3000, () => {
	console.log("[+] Server status : UP");
});

function serverStats(serverName,toClient,clientsCounter) {
	this.serverName = serverName;
	this.toClient = toClient;
	this.totalClients = clientsCounter;
}

function serializeMapUsers(activeUsersState) {
	const mapIter = activeUsersState.values();

	let responseUsersObj = new Array();

	for (let _i=0; _i < activeUsersState.size; _i++) {
		let name = mapIter.next().value;
		responseUsersObj.push(name);
	}

	return {active_users : responseUsersObj};
}
