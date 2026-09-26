import urllib.request
import json

data = json.dumps({
    "full_name": "Test User",
    "email": "test12345@test.com",
    "phone": "123456789",
    "password": "Password123!",
    "blood_type": "O+",
    "latitude": 24.8,
    "longitude": 67.0,
    "address": "Test"
}).encode('utf-8')

req = urllib.request.Request("http://localhost:8000/donors/signup", data=data, headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req) as res:
        print(res.status)
        print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print(e)
