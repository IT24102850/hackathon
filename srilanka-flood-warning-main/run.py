import os
import sys
import json
import time
import threading
import subprocess
import webbrowser
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler

from pymongo import MongoClient


MONGODB_URI = os.environ.get("MONGODB_URI")
MONGODB_DATABASE = os.environ.get("MONGODB_DATABASE", "srilanka_flood_warning")
MONGODB_COLLECTION = os.environ.get("MONGODB_COLLECTION", "community_reports")
_mongo_client = None
_reports_collection = None


def get_reports_collection():
    global _mongo_client, _reports_collection
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI is not configured")
    if _reports_collection is not None:
        return _reports_collection
    if _mongo_client is None:
        _mongo_client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            maxPoolSize=10,
        )
    database = _mongo_client[MONGODB_DATABASE]
    try:
        database.create_collection(MONGODB_COLLECTION)
    except Exception as error:
        if getattr(error, "code", None) != 48:
            raise

    _reports_collection = database[MONGODB_COLLECTION]
    _reports_collection.create_index([("timestamp", -1)], name="submitted_at_newest_first")
    return _reports_collection


def serialize_report(report):
    report["_id"] = str(report["_id"])
    if isinstance(report.get("timestamp"), datetime):
        report["timestamp"] = report["timestamp"].astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    return report


class ApplicationRequestHandler(SimpleHTTPRequestHandler):
    def send_json(self, status_code, payload):
        response = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def do_GET(self):
        if self.path == "/api/community-reports":
            try:
                reports = get_reports_collection().find().sort("timestamp", -1)
                self.send_json(200, [serialize_report(report) for report in reports])
            except Exception as error:
                print(f"MongoDB report read failed: {error}")
                self.send_json(503, {"error": "Report storage is unavailable"})
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/community-reports":
            self.send_error(404)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            report = json.loads(self.rfile.read(content_length))
            required_fields = ("reporterName", "mobileNumber", "district", "town", "waterDepth", "waterDepthLabel", "description")
            if not all(isinstance(report.get(field), str) and report[field].strip() for field in required_fields):
                self.send_json(400, {"error": "Report is missing required fields"})
                return
            report["timestamp"] = datetime.now(timezone.utc)
            result = get_reports_collection().insert_one(report)
            stored_report = get_reports_collection().find_one({"_id": result.inserted_id})
            self.send_json(201, serialize_report(stored_report))
        except (json.JSONDecodeError, ValueError):
            self.send_json(400, {"error": "Invalid report payload"})
        except Exception as error:
            print(f"MongoDB report write failed: {error}")
            self.send_json(503, {"error": "Report storage is unavailable"})

def start_streamlit():
    print("🚀 Starting Streamlit Dashboard on port 8501...")
    # Run Streamlit in headless mode so it doesn't open an extra browser tab automatically
    subprocess.run([sys.executable, "-m", "streamlit", "run", "app/app.py", "--server.port", "8501", "--server.headless", "true"])

def start_landing_page():
    print("🌐 Starting Landing Page Server on port 8000...")
    # Serve from the root directory so the outside 'images' folder is accessible
    server = HTTPServer(("localhost", 8000), ApplicationRequestHandler)
    server.serve_forever()

if __name__ == "__main__":
    # Start both servers in background threads
    threading.Thread(target=start_streamlit, daemon=True).start()
    threading.Thread(target=start_landing_page, daemon=True).start()
    
    # Give servers a few seconds to boot up
    time.sleep(3)
    
    print("✅ Opening Landing Page in your browser...")
    webbrowser.open("http://localhost:8000/app/landing.html")
    
    print("\nPress Ctrl+C to stop both servers.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")