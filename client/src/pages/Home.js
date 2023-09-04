import './Home.css';
import Chat from '../Chat';
import {useState, useEffect} from "react"
import io from "socket.io-client"
import Axios from "axios"
import { Link } from "react-router-dom"

// this connect backend to frontend
const socket = io.connect("http://localhost:3001")

export default function Home() {
  const [username, setUsername] = useState("")
  const [loggedInUsername, setLoggedInUsername] = useState("")
  const [room, setRoom] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const [loggedIn, setLoggedIn] = useState(false)

  Axios.defaults.withCredentials = true

  useEffect(() => {
    // every refresh get all the current rooms from the database
    Axios.get("http://localhost:3001/get-rooms").then((response) => {
      console.log(response.data)
      if (response.data.message !== "no rooms found") {
        let rooms = []
        for (let room of response.data) {
          console.log(room.name)
          rooms.push(room.name)
        }
        setAvailableRooms(rooms)
      }
    })

    Axios.get("http://localhost:3001/login").then((response) => {
        if (response.data.loggedIn) {
          console.log("IS LOGGED IN")
          setLoggedIn(true)
          setLoggedInUsername(response.data.user[0].username)
          setUsername(response.data.user[0].username)
        }
    })
  }, [])

  const createRoom = () => {
    if (availableRooms.includes(room)) {
      alert(`room ${room} already exists`)
    }
    if (username !== "" && room !== "" && !availableRooms.includes(room)) {
      setShowChat(true)
      socket.emit("join_room", room)
      setAvailableRooms([...availableRooms, room])
      Axios.post("http://localhost:3001/create-room", {username: username, roomName: room}).then((response) => {
        console.log(response)
      })
    }
  }

  const joinRoom = (roomTJ) => {
    if (username === "") {
      alert("choose a username before joining a room")
    } else {
      setRoom(roomTJ)
      setShowChat(true)
      socket.emit("join_room", roomTJ)
    }
  }

  const updateUsername = (event) => {
    if (loggedIn) {
      alert("you are logged in")
    } else {
      setUsername(event.target.value)
    }
  }

  return (
    <>
      <div className="loggedInArea">
        {loggedIn ? 
          <div>
            Logged in as {loggedInUsername}
          </div>
          :
          <div>
            <button>
              <Link to="/login">Login</Link> 
            </button>
          </div>
        }
      </div>
      <div className="App">
        
        {!showChat ?
        <div className="joinChatContainer">
          <div className="create-chat-area">
            <h3>chat app</h3>
            <p>create a chat or join an available one</p>
            <input type="text" placeholder="Lebron James" onChange={(event) => updateUsername(event)}/>
            <input type="text" placeholder="room ID" onChange={(event) => {setRoom(event.target.value)}}/>
            <button onClick={createRoom}>create room</button>
          </div>
          <div className="available-rooms">
            {availableRooms.map((availableRoom) => {
              return <button className="available-room" onClick={() => joinRoom(availableRoom)}> {availableRoom} </button>
            })}
          </div>
        </div>
        :
        <Chat socket={socket} username={username} room={room} showChat={showChat} setShowChat={setShowChat}/>
        }

      </div>
    </>
  );
}