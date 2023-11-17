/**
 * @description
 * Event handler to handle user related tasks.
 * Tasks included are create, read, delete.  
 * 
 * @param {Object} io - The socket.io server instance.
 * @param {Object} socket - The socket instance for the current connection.
 * @param {Map} - A map containing active users.
 */ 
export function serverEventsHandler(io,socket,activeUsers) {

	/**
	 * @description
	 * 
	 * Returns all the names of the users that active.
	 * 
	 * @return {Object} An object with field active_users that contains
	 * 				  an Array with the name of the users. 
	 */ 
	function getActiveUsers() {
		const activeUsersMapIter = activeUsers.values();

		const responseActiveUsersObject = new Array();

		for(let _it=0; _it < activeUsers.size; _it++) {
			let name = activeUsersMapIter.next().value;
			responseActiveUsersObject.push(name);
		}

		socket.emit("client/active_users", {active_users : responseActiveUsersObject});
		return {active_users : responseActiveUsersObject};
	}

	/**
	 * @desctiption
	 * Returns the total number of active users.
	 * 
	 * @return {number} The total number of active users.
	 * 
	 */ 
	function getTotalUsers() {
		return {clients_available : activeUsers.size};
	}

	/**
	 * @description
	 * Add a new user to the map that holds active users
	 * @param {Object} payload An object with the name of the new user.
	 */ 
	function addUser(payload) {
		
		activeUsers.set(socket.id, payload.name);

		/**
		 * Sends to all clients included the new one the updated
		 * list of the active users.
		 */ 
		socket.emit("client/active_users", getActiveUsers());
		socket.broadcast.emit("client/active_users", getActiveUsers());
	}

	/**
	 * @description
	 * Delete a user from the map when he disconnects.
	 */ 
	function deleteUser() {
		console.log(`[+] client disconnected : ${socket.id}`);
		activeUsers.delete(socket.id);
		socket.broadcast.emit("client/active_users", getActiveUsers());
	}

	socket.on("server_stats/active_users", getActiveUsers);
	socket.on("server_stats/total_users", getTotalUsers);
	socket.on("server_stats/add_user", addUser);
	socket.on("disconnect", deleteUser);

}