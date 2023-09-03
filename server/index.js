const express = require("express")
const app = express()
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")
const mysql = require("mysql")

const bcrypt = require("bcrypt")
const saltRounds = 10

// sessions
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const session = require("express-session")

app.use(express.json())
app.use(cors({
    // need to set this for using cookies
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    key: "userId",
    secret: "lebronJames",
    resave: false,
    saveUninitialized: false,
    cookie: {
        // expires in 24 hours - have to write it in milliseconds
        expires: 60 * 60 * 24,
    },
}))

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // it is ok to accept communication with this url (this is the url for react app)
        methods: ["GET", "POST"],
    }
})

// listening for events in the socket.io server
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on("join_room", (data) => {
        socket.join(data)
        console.log(`User with ID: ${socket.id} joined room: ${data}`)
    })

    socket.on("send_message", (data) => {
        console.log(data)
        socket.to(data.room).emit("receive_message", data)
    })

    // listen for disconnecting from the server
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id)
    })
})

// database stuff

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "password",
    database: "LoginSystem",
})

app.post("/register", (req, res) => {
    const username = req.body.username
    const password = req.body.password
    
    // hashing the password
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err)
        }
        db.query("INSERT INTO users (username, password) VALUES (?,?)", [username, hash], (err, result) => {
            console.log(err)
        })
    })
})

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({loggedIn: true, user: req.session.user})
    } else {
        res.send({loggedIn: false})
    }
})

app.post("/login", (req, res) => {
    const username = req.body.username
    const password = req.body.password
    db.query("SELECT * FROM users WHERE username = ?", username, (err, result) => { if (err) {
            res.send({err: err})
        }

        if (result.length > 0) {
            // check if password is correct
            bcrypt.compare(password, result[0].password, (err, response) => {
                if (response) {
                    // create a session
                    req.session.user = result
                    console.log(req.session.user)
                    res.send(result)
                } else {
                    res.send({message: "username or password incorrect"})
                }
            })
        } else {
            res.send({message: "user doesn't exist"})
        }
    })

})

// rooms
app.post("/create-room", (req, res) => {
    const username = req.body.username
    const roomName = req.body.roomName
    db.query("INSERT INTO rooms (creator, name) VALUES (?,?)", 
            [username, roomName], 
            (err, result) => {
                console.log(err)
    })
    // create a new table for that room that stores all the messages sent on that room
    db.query("CREATE TABLE " + roomName + " AS SELECT id, message, writer FROM chat_blueprint",
            (err, result) => {
                console.log(err)
    })
})

app.get("/get-rooms", (req, res) => {
    db.query("SELECT * FROM rooms", (err, result) => {
        if (err) {
            res.send({err: err})
        } 
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({message: "no rooms found"})
        }
    }) 
})

app.post("/sent-message", (req, res) => {
    const messageSent = req.body.message
    const writer = req.body.username
    const roomName = req.body.roomName
    db.query("INSERT INTO " + roomName + " (message, writer) VALUES (?,?)",
            [messageSent, writer],
            (err, result) => {
                console.log(err)
            })
})

app.get("/get-messages", (req, res) => {
    const roomName = req.query.roomName
    db.query("SELECT * FROM " + roomName, (err, result) => {
        if (err) {
            res.send({err:err})
        }
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({message: "no previous messages found"})
        }
    })
})

app.post("/delete-room", (req, res) => {
    const roomName = req.body.roomName
    const username = req.body.username
    console.log(roomName, username)
    // only let the user delete the room if they are the user that created it
    db.query("SELECT creator FROM rooms WHERE name = ?", 
            roomName, 
            (err, result) => {
                if (err) {
                    res.send({err:err})
                } 
                else if (username == result[0].creator) {
                    // delete the table for that room and delete that table from rooms table
                    db.query("DROP TABLE " + roomName, (err, res) => {
                        console.log(err)
                    })
                    db.query("DELETE FROM rooms WHERE name = ?", roomName, (err, res) => {
                        console.log(err)
                    })
                    console.log("room deleted successfully")
                } else {
                    res.send({message: username + " does not have perms to delete this chat"})
                }
            })
})

server.listen(3001, () => {
    console.log("server is running")
})