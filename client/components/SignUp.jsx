import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/Auth";
import "./styling/Login.css";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("cse1"); 
  const [semester, setSemester] = useState("1"); 

  const { user, setUser } = useAuth();
  const nav = useNavigate();

  const getYearFromSemester = (sem) => {
    const semNum = parseInt(sem, 10);
    if (semNum <= 2) return 1;
    if (semNum <= 4) return 2;
    if (semNum <= 6) return 3;
    return 4;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const newUserPayload = {
        id: self.crypto.randomUUID(),
        email: email,
        password: password,
        token: `mock-jwt-token-${Math.random().toString(36).substr(2, 9)}`, 
        user: {
          name: name, 
          email: email,
          batch: batch, 
          year: getYearFromSemester(semester), 
          semester: semester 
        }
      };

      const response = await axios.post("http://localhost:5000/auth", newUserPayload);
      
      if (response.status === 201 || response.data) {
        alert("Account SuccessFully Created");
        nav("/Login");
      }
    } catch (err) {
      alert(err + "SignUp Failed");
    }
  };

  return (
    <div className="portal-container">
      <div className="portal-header">
        <h1>IIITSuratMods</h1>
        <p>IIIT Surat Portal</p>
      </div>

      <div className="login-card">
        <form onSubmit={handleSignup}>
          
          <div className="input-group">
            <label>NAME</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input 
                placeholder="Your Full Name" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>EMAIL</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input 
                placeholder="College Email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>BATCH</label>
            <div className="input-wrapper">
              <select 
                value={batch} 
                onChange={(e) => setBatch(e.target.value)}
                className="select-input" 
                required
              >
                <option value="cse1">CSE 1</option>
                <option value="cse2">CSE 2</option>
                <option value="mnc">MNC</option>
                <option value="ece">ECE</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>SEMESTER</label>
            <div className="input-wrapper">
              <select 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)}
                className="select-input"
                required
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>SET PASSWORD</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                placeholder="••••••••" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="login-btn">SignUp</button>
        </form>

        <div className="signup-text">
          Have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}