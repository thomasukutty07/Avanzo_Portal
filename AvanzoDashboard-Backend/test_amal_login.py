import requests

BASE_URL = "http://localhost:8000"

def test_login():
    login_url = f"{BASE_URL}/api/auth/login/"
    creds = {"email": "amal@gmail.com", "password": "amalmm@123"}
    
    print(f"Testing login with {creds}...")
    res = requests.post(login_url, json=creds)
    if res.status_code != 200:
        print(f"Login failed: {res.status_code}")
        print(res.text)
        return
    
    tokens = res.json()
    access = tokens["access"]
    print("Login success.")
    
    me_url = f"{BASE_URL}/api/auth/me/"
    headers = {"Authorization": f"Bearer {access}"}
    print("Testing /api/auth/me/...")
    res = requests.get(me_url, headers=headers)
    print(f"Result: {res.status_code}")
    print(res.json())

if __name__ == "__main__":
    test_login()
