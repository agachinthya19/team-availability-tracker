from flask import Flask, jsonify, request, render_template
import sqlite3, json, os

app = Flask(__name__)
DB = "team.db"

def connect():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

def setup_database():
    con = connect()
    con.execute("""
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT NOT NULL,
            timezone TEXT NOT NULL
        )
    """)
    count = con.execute("SELECT COUNT(*) FROM members").fetchone()[0]
    if count == 0:
        with open("data/team.json", encoding="utf-8") as f:
            seed = json.load(f)
        con.executemany(
            "INSERT INTO members (id,name,role,status,timezone) VALUES (?,?,?,?,?)",
            [(m["id"],m["name"],m["role"],m["status"],m["timezone"]) for m in seed]
        )
    con.commit()
    con.close()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/members", methods=["GET"])
def get_members():
    con = connect()
    data = [dict(row) for row in con.execute("SELECT * FROM members ORDER BY id")]
    con.close()
    return jsonify(data)

@app.route("/api/members/<int:member_id>", methods=["PATCH"])
def update_member(member_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ["Available", "Busy", "Away"]:
        return jsonify({"error": "Choose Available, Busy, or Away"}), 400
    con = connect()
    cur = con.execute("UPDATE members SET status=? WHERE id=?", (status, member_id))
    con.commit()
    con.close()
    if cur.rowcount == 0:
        return jsonify({"error": "Team member not found"}), 404
    return jsonify({"message": "Status updated"})

if __name__ == "__main__":
    setup_database()
    app.run(debug=True)
