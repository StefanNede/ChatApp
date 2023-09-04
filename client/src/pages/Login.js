import { useState, useEffect} from "react"
import Axios from "axios"

export default function Login(props) {
    const [usernameReg, setUsernameReg] = useState("")
    const [passwordReg, setPasswordReg] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loginStatus, setLoginStatus] = useState("")

    Axios.defaults.withCredentials = true
    const register = () => {
        Axios.post("http://localhost:3001/register", {username: usernameReg, password: passwordReg}).then((response) => {
            if (response.data) {
                alert(response.data.message)
            }
            console.log(response)
        })
    }

    const login = () => {
        Axios.post("http://localhost:3001/login", {username: username, password: password}).then((response) => {
            let data = response.data
            if (data.message) {
                setLoginStatus("")
            } else {
                // user logged in
                setLoginStatus("Logged in as " + data[0].username)
            }
        })
    }

    useEffect(() => {
        Axios.get("http://localhost:3001/login").then((response) => {
            if (response.data.loggedIn) {
                setLoginStatus("Logged in as: " + response.data.user[0].username)
            }
        })
    }, [])

    return (
        <div>
            <div className="registration">
                <h1>Registration</h1>
                <label>Username</label>
                <input type="text" onChange={(event) => setUsernameReg(event.target.value)}/>
                <label>Password</label>
                <input type="text" onChange={(event) => setPasswordReg(event.target.value)}/>
                <button onClick={register}>Register</button>
            </div>
            <div className="login"> 
                <h1>Login</h1>
                <input type="text" placeholder="Username..." onChange={(event) => setUsername(event.target.value)}/>
                <input type="password" placeholder="Password..." onChange={(event) => setPassword(event.target.value)}/>
                <button onClick={login}>Login</button>
            </div>

            <h1>{loginStatus}</h1>
        </div>
    )
}