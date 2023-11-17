/**
 * @description
 * Event handler to handle user message tasks.  
 * 
 * @param {Object} io - The socket.io server instance.
 * @param {Object} socket - The socket instance for the current connection.
 */ 
export function messageHandler(io,socket) {

	/**
	 * @description 
	 * Delivers a message to connected clients.
	 * 
	 * @param {Object} payload - The message to be delivered.
	 */ 
	function broadcastMessage(payload) {
		socket.broadcast.emit("message/receive_public", payload);
	}

	socket.on("message/post_public", broadcastMessage);
}