import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/Auth";
import "./styling/Login.css";
import { useNavigate,Route,Routes,Link } from "react-router-dom";
import SignUp from "./Signup";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user,setUser } = useAuth();
  const nav = useNavigate();
  useEffect(()=>{
    const savedProfile = localStorage.getItem("userProfile");
    if(user || savedProfile){
      nav("/dashboard")
    }
  },[user])
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // backend se aayga tab... const response = await axios.post("mohit diksha url",{email ,password})
      const mockUrl = `http://localhost:5000/auth?email=${email}&password=${password}`;
      const response = await axios.get(mockUrl);
      
      if (response.data && response.data.length > 0) {
        localStorage.setItem("userToken", response.data[0].token);
        localStorage.setItem("userProfile", JSON.stringify(response.data[0].user));
        setUser(response.data[0].user);
        window.location.href = "/dashboard";
      } else {
        alert("Invalid Email or Password!");
      }
    } catch (err) {
      alert("Login Failed");
    }
  };

  return (
    <div className="portal-container">
      <div className="portal-header">
        <h1>IIITSuratMods</h1>
        <p>IIIT Surat Portal</p>
      </div>

      <div className="login-card">
        <form onSubmit={handleLogin}>
          
          <div className="input-group">
            <label>USERNAME</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input 
                placeholder="College Email" 
                type="email" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>PASSWORD</label>
              <a href="#forgot" className="forgot-link">Forgot?</a>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                placeholder="••••••••" 
                type="password" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="login-btn">LOGIN</button>
        </form>

        <div className="signup-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}