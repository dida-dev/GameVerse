import http.server
import socketserver
import json
import sqlite3
import os
from tkinter import *

PORT = 8000
DB_FILE = "users.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

class CorporateHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        data = json.loads(post_data)
        
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        response = {"success": False, "message": ""}
        
        if self.path == "/api/register":
            try:
                cursor.execute(
                    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                    (data['username'], data['email'], data['password'])
                )
                conn.commit()
                response = {"success": True, "username": data['username']}
            except sqlite3.IntegrityError:
                response = {"success": False, "message": "Email is already registered."}
                
        elif self.path == "/api/login":
            cursor.execute(
                "SELECT username FROM users WHERE email = ? AND password = ?",
                (data['email'], data['password'])
            )
            user = cursor.fetchone()
            if user:
                response = {"success": True, "username": user[0]}
            else:
                response = {"success": False, "message": "Invalid email or password configuration."}
                
        conn.close()
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

init_db()
print(f"🚀 Companie Hub active locally at: http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), CorporateHandler) as httpd:
    httpd.serve_forever()

window = Tk.winfo_atom