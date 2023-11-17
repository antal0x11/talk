import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";

function App() {
  
  const [client,setClient] = useState(null);
  const [msg,setMsg] = useState("");
  const [connected,setConnected] = useState(false);
  const [inbox,setInbox] = useState([]);
  const [clientName,setClientName] = useState(null);
  const [usernameState,setUsernameState] = useState(true);
  const [activeUsers,setActiveUsers] = useState([]);
  const txtArea = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_URL_SERVER);
    socket.emit("server_stats/active_users", {});
    setClient(socket);

    socket.on("connected", () => {
      console.log("sending request");
      setConnected(true);
    });

    socket.on("connect_error", () => {
      setClientName(null);
      setConnected(false);
      setInbox([]);
      setMsg("");
      setClient(null);
      setUsernameState(true);
      setActiveUsers([]);
    });

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("message/receive_public", (obj) => {
      setInbox(prev => [...prev,obj]);
    });

    socket.on("client/active_users", (obj) => {
      setActiveUsers(obj.active_users);
    })

    return () => {
      socket.disconnect();
    }
  }, [])

  function handleInput(e) {
    setMsg(e.target.value);
  }

  function handleSendMsg() {
    if (msg.lenght !== 0 && client && !usernameState) {

      const tmpMsgObj = {
        from: clientName,
        message : msg,
        timestamp: new Date().toLocaleString()
      };

      setInbox(prev => [...prev,tmpMsgObj])
      client.emit("message/post_public", tmpMsgObj);
      txtArea.current.value = "";
      setMsg("");
    } else {
      if (msg.length === 0) {
        alert("Empty text area");
      } else if(!client) {
        alert("You are disconnected");
      } else {
        alert("you have to select username");
      }
    }
  }

  function handleClientName(e) {
    if (e.target.value <= 0) {
      return;
    }

    const candidateName = e.target.value;

    setClientName(candidateName.toUpperCase().slice(0,1) + candidateName.toLowerCase().slice(1));
  }

  function lockUserName() {
    if (clientName === null) {
      return;
    }

    const userExists = activeUsers.find(activeName => activeName === clientName);

    if (userExists !== undefined) {
      alert("User name not available at the moment.");
      return;
    }

    if (client && clientName.lenght !== 0) {
      client.emit("server_stats/add_user", {name : clientName});
    }
    setUsernameState(false);
  }

  return (
    <>
      <h2>Talk</h2>
      <div id="container">
        <ul className="chat">
          <li>Live Message Feed</li>
          {
            inbox.lenght !== 0 &&
            inbox.map((item,index) => {
              if (item.from === clientName) {
                return <li 
                  key={index} 
                >Me [{item.timestamp}]: {item.message}</li>
              } else {
                return <li 
                  key={index}
                >{item.from} [{item.timestamp}]: {item.message}</li>
              }
            })
          }
        </ul>
        <div id="box">
          <div className="status-head">
            {connected ? 
              <h4>Status: Connected</h4> 
              : 
              <h4>Status : Disconnected</h4>
            }
            <h4>Available: {activeUsers.length}</h4>
          </div>
          <textarea ref={txtArea} placeholder='Write your message...' onInput={handleInput}></textarea>
          <button onClick={handleSendMsg}>Send</button>  
          {(usernameState) ?
            <div id="client-name">
              <input placeholder='Type your username...' 
                    onInput={handleClientName}/>
              <button onClick={lockUserName}>Submit</button>
            </div>
            : <h4>name: {clientName}</h4>
          }
          <ul className="active-users">
            <li style={{color : "yellow"}}>Active Users</li>
            {
              activeUsers.length !== 0 &&
              activeUsers.map((item,index) => {

                if (item === clientName) {
                  return <li key={index}>{item}[Me]</li>
                } else {
                  return <li key={index}>{item}</li>
                }
              })
            }
          </ul>
        </div>

      </div>
    </>
  )
}

export default App
