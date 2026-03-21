import requests
import sys
import json
from datetime import datetime

class ArtSyncAPITester:
    def __init__(self, base_url="https://artist-messaging.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health"""
        return self.run_test("Health Check", "GET", "", 200)

    def test_seed_data(self):
        """Test seeding sample data"""
        return self.run_test("Seed Data", "POST", "seed", 200)

    def test_register_user(self):
        """Test user registration"""
        test_user_data = {
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "testpass123",
            "name": "Test Artist",
            "artist_type": "Digital Artist",
            "bio": "Test bio for automated testing"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Registered user ID: {self.user_id}")
            return True
        return False

    def test_login_seeded_user(self):
        """Test login with seeded user"""
        login_data = {
            "email": "luna@artsync.com",
            "password": "password123"
        }
        
        success, response = self.run_test(
            "Login Seeded User",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Logged in user ID: {self.user_id}")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_get_artists(self):
        """Test getting artists list"""
        return self.run_test("Get Artists", "GET", "artists", 200)

    def test_get_featured_artists(self):
        """Test getting featured artists"""
        return self.run_test("Get Featured Artists", "GET", "artists/featured", 200)

    def test_search_artists(self):
        """Test searching artists"""
        return self.run_test("Search Artists", "GET", "artists?search=Luna", 200)

    def test_filter_artists(self):
        """Test filtering artists by type"""
        return self.run_test("Filter Artists", "GET", "artists?artist_type=Digital Artist", 200)

    def test_get_artist_by_id(self):
        """Test getting specific artist"""
        # First get artists to find an ID
        success, response = self.run_test("Get Artists for ID Test", "GET", "artists", 200)
        if success and response and len(response) > 0:
            artist_id = response[0]['id']
            return self.run_test("Get Artist by ID", "GET", f"artists/{artist_id}", 200)
        return False

    def test_update_profile(self):
        """Test updating user profile"""
        update_data = {
            "bio": "Updated bio from automated test"
        }
        return self.run_test("Update Profile", "PUT", "artists/me", 200, data=update_data)

    def test_send_message(self):
        """Test sending a message"""
        # First get artists to find someone to message
        success, response = self.run_test("Get Artists for Messaging", "GET", "artists", 200)
        if success and response and len(response) > 0:
            # Find an artist that's not the current user
            target_artist = None
            for artist in response:
                if artist['id'] != self.user_id:
                    target_artist = artist
                    break
            
            if target_artist:
                message_data = {
                    "receiver_id": target_artist['id'],
                    "content": "Hello! This is a test message from automated testing."
                }
                return self.run_test("Send Message", "POST", "messages", 200, data=message_data)
        
        self.log_test("Send Message", False, "No suitable recipient found")
        return False

    def test_get_conversations(self):
        """Test getting conversations"""
        return self.run_test("Get Conversations", "GET", "messages/conversations", 200)

    def test_get_messages(self):
        """Test getting messages with a user"""
        # First get conversations to find a user to get messages with
        success, response = self.run_test("Get Conversations for Messages", "GET", "messages/conversations", 200)
        if success and response and len(response) > 0:
            other_user_id = response[0]['user']['id']
            return self.run_test("Get Messages", "GET", f"messages/{other_user_id}", 200)
        
        # If no conversations, that's also valid
        self.log_test("Get Messages", True, "No conversations to test with")
        return True

    def test_logout(self):
        """Test logout"""
        return self.run_test("Logout", "POST", "auth/logout", 200)

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        }
        return self.run_test("Invalid Login", "POST", "auth/login", 401, data=invalid_data)

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, _ = self.run_test("Unauthorized Access", "GET", "auth/me", 401)
        
        # Restore token
        self.token = temp_token
        return success

def main():
    print("🚀 Starting ArtSync API Testing...")
    print("=" * 50)
    
    tester = ArtSyncAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Seed Data", tester.test_seed_data),
        ("User Registration", tester.test_register_user),
        ("Get Current User", tester.test_get_current_user),
        ("Get Artists", tester.test_get_artists),
        ("Get Featured Artists", tester.test_get_featured_artists),
        ("Search Artists", tester.test_search_artists),
        ("Filter Artists", tester.test_filter_artists),
        ("Get Artist by ID", tester.test_get_artist_by_id),
        ("Update Profile", tester.test_update_profile),
        ("Send Message", tester.test_send_message),
        ("Get Conversations", tester.test_get_conversations),
        ("Get Messages", tester.test_get_messages),
        ("Logout", tester.test_logout),
        ("Login Seeded User", tester.test_login_seeded_user),
        ("Invalid Login", tester.test_invalid_login),
        ("Unauthorized Access", tester.test_unauthorized_access),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            tester.log_test(test_name, False, f"Test execution failed: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {tester.tests_run}")
    print(f"Passed: {tester.tests_passed}")
    print(f"Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    # Print failed tests
    failed_tests = [result for result in tester.test_results if not result['success']]
    if failed_tests:
        print("\n❌ FAILED TESTS:")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['details']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())