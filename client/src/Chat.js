import React, { useState, useMemo, useEffect } from "react"
import ScrollToBottom from "react-scroll-to-bottom";
import Axios from "axios"

const Chat = ({socket, username, room, showChat, setShowChat}) => {
    const [currentMessage, setCurrentMessage] = useState("")
    const [messageList, setMessageList] = useState([])

    Axios.defaults.withCredentials = true
    useEffect(() => {
        // load all past messages
        Axios.get("http://localhost:3001/get-messages", { params: { roomName: room } }).then((response) => {
            if (response.data.message !== "no previous messages found") {
                let messages = []
                for (let message of response.data) {
                    messages.push({room: room,
                                    author: message.writer,
                                    message: message.message})
                }
                setMessageList(messages)
            }
        })
    }, [])

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
            }

            Axios.post("http://localhost:3001/sent-message", {message: currentMessage, username: username, roomName: room}).then((response) => {
                console.log(response)
            })
            await socket.emit("send_message", messageData)
            setMessageList((list) => [...list, messageData])
            setCurrentMessage("")
        }
    }

    useMemo(() => {
        socket.on("receive_message", (data) => {
            console.log(data)
            setMessageList((list) => [...list, data])
        })
    }, [socket])

    const deleteChat = () => {
        Axios.post("http://localhost:3001/delete-room", {roomName: room, username: username}).then((response) => {
            console.log(response)
            if (response.data) {
                alert(response.data.message)
            } 
        })
        window.location.reload()
    }

    return (
        <div className="chat-page">
            <div className="chat-window">
                <div className="chat-header">
                    <p>Room {room}</p>
                    <button className="delete-chat-btn" onClick={deleteChat}>x</button>
                </div>
                <div className="chat-body">
                    <ScrollToBottom className="message-container">
                    {messageList.map((messageContent) => {
                        return (
                        <div
                            className="message"
                            id={username === messageContent.author ? "you" : "other"}
                        >
                            <div>
                            <div className="message-content">
                                <p>{messageContent.message}</p>
                            </div>
                            <div className="message-meta">
                                <p id="author">{messageContent.author}</p>
                            </div>
                            </div>
                        </div>
                        );
                    })}
                    </ScrollToBottom>
                </div>
                <div className="chat-footer">
                    <input
                        type="text"
                        value={currentMessage}
                        placeholder="Hey..."
                        onChange={(event) => {
                            setCurrentMessage(event.target.value);
                        }}
                        onKeyPress={(event) => {
                            event.key === "Enter" && sendMessage();
                        }}
                    />
                    <button onClick={sendMessage}>&#9658;</button>
                </div>
            </div> 
        </div>
    )
}

export default Chat