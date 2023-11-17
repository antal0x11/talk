import "dotenv/config";
import { Server } from "socket.io";
import { createServer } from "http";
import { serverEventsHandler } from "./events/server_stats.js";
import { messageHandler } from "./events/message.js";

const httpServer = createServer((request,response) => {
	response.setHeader("Content-Type","application/json");
	response.end(JSON.stringify(
		{
			"server_status": "up",
			"message" : "hey",
			"timestamp": new Date().toISOString().split("T").join(" ") 
		}));
});
const io = new Server(httpServer, {
	cors: {
		origin: process.env.URL_UI
	}
});

const activeUsers = new Map();

io.on("connection", (socket) => {

	console.log(`[+] client connected : ${socket.id}`);

	serverEventsHandler(io,socket,activeUsers);
	messageHandler(io,socket);

});

httpServer.listen(3000, () => {
	console.log("[+] Server status : UP");
});
