import requests
import json

# Try to get projects and see their department structure
try:
    # Attempt to find projects (assuming some might be public or local dev has no auth for this check)
    # We really need a token, but let's see if we can get anything or guess the ID format
    r = requests.get("http://localhost:8000/api/projects/projects/")
    data = r.json()
    results = data if isinstance(data, list) else data.get('results', [])
    if results:
        print(f"Sample Project: {json.dumps(results[0], indent=2)}")
    else:
        print("No projects found.")
except Exception as e:
    print(f"Error: {e}")
