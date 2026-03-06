import requests
import json

def test_login(email, password):
    url = "http://localhost:8000/auth/login"
    data = {"email": email, "password": password}
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    print("Testing admin login...")
    test_login("admin@tech4u.es", "Tecnologia4u_2024!")
    print("\nTesting alumno login...")
    test_login("alumno1@tech4u.es", "Tecnologia4u_2024!")
