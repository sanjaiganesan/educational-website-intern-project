import unittest
import json
# from flask import Flask
from app import app  # Assuming your Flask app is defined in a file named app.py

class FlaskAppTest(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_login_successful(self):
        # Assuming you have a valid test account in your database
        user_data = {
            "username": "mathan",
            "password": "1234"
        }

        response = self.app.post('/login', json=user_data)
        data = json.loads(response.data.decode('utf-8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["status"], "Success")
        self.assertIsNotNone(data["username"])
        self.assertIsNotNone(data["email"])
        self.assertIsNotNone(data["image"])
        self.assertIsNotNone(data["role"])

    def test_login_invalid_credentials(self):
        user_data = {
            "username": "invaliduser",
            "password": "invalidpassword"
        }

        response = self.app.post('/login', json=user_data)
        data = json.loads(response.data.decode('utf-8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["status"], "Invalid username or password")

    def test_register_successful(self):
        # Assuming you have valid test user data for registration
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword",
            "role": "user",
            "image": "profile_image.jpg"
        }

        response = self.app.post('/register', json=user_data)
        data = json.loads(response.data.decode('utf-8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["status"], "success")

if __name__ == '__main__':
    unittest.main()
