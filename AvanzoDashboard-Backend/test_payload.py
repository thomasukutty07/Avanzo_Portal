import requests
import jwt

BASE_URL = "http://localhost:8000"

def test_token_payload():
    login_url = f"{BASE_URL}/api/auth/login/"
    creds = {"email": "amal@gmail.com", "password": "amalmm@123"}
    
    res = requests.post(login_url, json=creds)
    if res.status_code != 200:
        print(f"Login failed: {res.status_code}")
        return
    
    tokens = res.json()
    access = tokens["access"]
    decoded = jwt.decode(access, options={"verify_signature": False})
    print(f"Token Payload: {decoded}")

if __name__ == "__main__":
    test_token_payload()
