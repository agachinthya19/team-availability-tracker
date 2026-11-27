# Team Availability Tracker

## 1. Install Python packages
Open a terminal inside this folder and run:
```bash
pip install flask
```

## 2. Start the website
```bash
python app.py
```

## 3. Open in your browser
Go to: http://127.0.0.1:5000

## How it works
- Flask provides REST API endpoints.
- SQLite stores team members and their statuses in `team.db`.
- The first run imports the 40 records from `data/team.json`.
- Changing a status saves it to the database.
- The browser refreshes the data every 5 seconds so other open browsers see updates.

To reset the sample database, stop the server, delete `team.db`, and run `python app.py` again.
