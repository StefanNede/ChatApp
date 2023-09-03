import React, { useState, useMemo } from "react"
import ScrollToBottom from "react-scroll-to-bottom";
import Axios from "axios"

const Chat = ({socket, username, room, showChat, setShowChat}) => {
    const [currentMessage, setCurrentMessage] = useState("")
    const [messageList, setMessageList] = useState([])

    Axios.defaults.withCredentials = true
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

    return (
        <div className="chat-page">
            <div className="chat-window">
                <div className="chat-header">
                    <p>Room {room}</p>
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