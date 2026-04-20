import requests
import json

# Try to get departments from the local server
try:
    # Assuming no auth for internal check or trying common paths
    r = requests.get("http://localhost:8000/api/organization/departments/")
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
