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

let totalClients = 0

io.on("connection", (socket) => {
	totalClients++;
	console.log(`[+] client connected : ${socket.id}`);
	socket.broadcast.emit("client_status", {clients_available : totalClients});

	socket.on("disconnect", () => {
		console.log(`[+] client disconnected : ${socket.id}`);
		totalClients--;
		socket.broadcast.emit("client_status", {clients_available : totalClients});
	});

	socket.on("message", (msg) => {

		// console.log(msg + socket.id);
		socket.broadcast.emit("message", msg);
	});

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
