from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import sqlite3
import hashlib

app = FastAPI()

# --- Database Setup ---
conn = sqlite3.connect("users.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
)
""")
conn.commit()

# --- Models ---
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # Donor / Recipient / Volunteer / Admin

class LoginRequest(BaseModel):
    email: str
    password: str

# --- Helpers ---
def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

# --- Routes ---
@app.post("/signup")
def signup(data: SignupRequest):
    hashed_pw = hash_password(data.password)
    try:
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                       (data.name, data.email, hashed_pw, data.role))
        conn.commit()
        return {"message": "User registered successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists")

@app.post("/login")
def login(data: LoginRequest):
    hashed_pw = hash_password(data.password)
    cursor.execute("SELECT role FROM users WHERE email=? AND password=?", (data.email, hashed_pw))
    row = cursor.fetchone()
    if row:
        return {"message": "Login successful", "role": row[0]}
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")
