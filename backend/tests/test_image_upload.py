"""
Test suite for Art Connect Africa - Image Upload and Display Features
Tests avatar upload, post image upload, and getMediaUrl functionality
"""
import pytest
import requests
import os
import tempfile
from PIL import Image
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://artiste-hub-3.preview.emergentagent.com').rstrip('/')

# Test credentials
ARTIST_EMAIL = "amara.diallo@artconnect.africa"
ARTIST_PASSWORD = "password123"


class TestImageUploadAndDisplay:
    """Tests for image upload and display functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as artist
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ARTIST_EMAIL,
            "password": ARTIST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        self.token = data["token"]
        self.user = data["user"]
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        
    def create_test_image(self, width=100, height=100, format='PNG'):
        """Create a test image in memory"""
        img = Image.new('RGB', (width, height), color='red')
        buffer = io.BytesIO()
        img.save(buffer, format=format)
        buffer.seek(0)
        return buffer
    
    # ============== Avatar Upload Tests ==============
    
    def test_avatar_upload_endpoint_exists(self):
        """Test that avatar upload endpoint exists"""
        # Create a test image
        img_buffer = self.create_test_image()
        
        # Remove Content-Type header for multipart upload
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/artists/me/avatar",
            headers=headers,
            files={"file": ("test_avatar.png", img_buffer, "image/png")}
        )
        
        assert response.status_code == 200, f"Avatar upload failed: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verify avatar URL is returned
        assert "avatar" in data, "Response should contain avatar field"
        assert data["avatar"].startswith("/uploads/avatars/"), f"Avatar URL should start with /uploads/avatars/, got: {data['avatar']}"
        print(f"✓ Avatar uploaded successfully: {data['avatar']}")
    
    def test_avatar_upload_invalid_file_type(self):
        """Test that invalid file types are rejected"""
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create a fake text file
        response = requests.post(
            f"{BASE_URL}/api/artists/me/avatar",
            headers=headers,
            files={"file": ("test.txt", b"not an image", "text/plain")}
        )
        
        assert response.status_code == 400, f"Should reject invalid file type, got: {response.status_code}"
        print("✓ Invalid file type correctly rejected")
    
    def test_avatar_upload_updates_user_profile(self):
        """Test that avatar upload updates the user profile"""
        img_buffer = self.create_test_image()
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Upload avatar
        response = requests.post(
            f"{BASE_URL}/api/artists/me/avatar",
            headers=headers,
            files={"file": ("test_avatar.png", img_buffer, "image/png")}
        )
        assert response.status_code == 200
        uploaded_avatar = response.json()["avatar"]
        
        # Verify user profile has updated avatar
        me_response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 200
        user_data = me_response.json()
        
        assert user_data["avatar"] == uploaded_avatar, f"User avatar should be updated. Expected: {uploaded_avatar}, Got: {user_data['avatar']}"
        print(f"✓ User profile avatar updated correctly: {user_data['avatar']}")
    
    def test_uploaded_avatar_is_accessible(self):
        """Test that uploaded avatar file is accessible via URL"""
        img_buffer = self.create_test_image()
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Upload avatar
        response = requests.post(
            f"{BASE_URL}/api/artists/me/avatar",
            headers=headers,
            files={"file": ("test_avatar.png", img_buffer, "image/png")}
        )
        assert response.status_code == 200
        avatar_path = response.json()["avatar"]
        
        # Avatar path is /uploads/... but we need to access via /api/uploads/...
        api_path = avatar_path.replace('/uploads/', '/api/uploads/')
        full_url = f"{BASE_URL}{api_path}"
        file_response = requests.get(full_url)
        
        assert file_response.status_code == 200, f"Avatar file should be accessible at {full_url}, got: {file_response.status_code}"
        assert "image" in file_response.headers.get("content-type", ""), "Response should be an image"
        print(f"✓ Avatar file accessible at: {full_url}")
    
    # ============== Post Image Upload Tests ==============
    
    def test_post_with_image_upload(self):
        """Test creating a post with image upload"""
        img_buffer = self.create_test_image(200, 200)
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/posts/upload",
            headers=headers,
            files={"file": ("test_post_image.png", img_buffer, "image/png")},
            data={
                "content_type": "image",
                "text_content": "Test post with image upload"
            }
        )
        
        assert response.status_code == 200, f"Post upload failed: {response.status_code} - {response.text}"
        data = response.json()
        
        assert "media_url" in data, "Post should have media_url"
        assert data["media_url"].startswith("/uploads/posts/"), f"Media URL should start with /uploads/posts/, got: {data['media_url']}"
        assert data["content_type"] == "image"
        print(f"✓ Post with image created: {data['media_url']}")
        
        # Cleanup - delete the post
        delete_response = self.session.delete(f"{BASE_URL}/api/posts/{data['id']}")
        assert delete_response.status_code == 200
    
    def test_post_image_is_accessible(self):
        """Test that post images are accessible via URL"""
        img_buffer = self.create_test_image(200, 200)
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create post with image
        response = requests.post(
            f"{BASE_URL}/api/posts/upload",
            headers=headers,
            files={"file": ("test_post_image.png", img_buffer, "image/png")},
            data={
                "content_type": "image",
                "text_content": "Test post image accessibility"
            }
        )
        assert response.status_code == 200
        media_url = response.json()["media_url"]
        post_id = response.json()["id"]
        
        # Access the image via /api/uploads/
        api_path = media_url.replace('/uploads/', '/api/uploads/')
        full_url = f"{BASE_URL}{api_path}"
        file_response = requests.get(full_url)
        
        assert file_response.status_code == 200, f"Post image should be accessible at {full_url}"
        print(f"✓ Post image accessible at: {full_url}")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/posts/{post_id}")
    
    # ============== Feed Image Display Tests ==============
    
    def test_feed_posts_have_correct_media_urls(self):
        """Test that feed posts return correct media URLs"""
        response = self.session.get(f"{BASE_URL}/api/posts")
        assert response.status_code == 200
        
        posts = response.json()
        assert len(posts) > 0, "Should have posts in feed"
        
        for post in posts:
            if post.get("media_url"):
                media_url = post["media_url"]
                # Check if it's a local upload or external URL
                if media_url.startswith("/uploads/"):
                    # Local upload - should be accessible via /api/uploads/
                    api_path = media_url.replace('/uploads/', '/api/uploads/')
                    full_url = f"{BASE_URL}{api_path}"
                    file_response = requests.get(full_url)
                    assert file_response.status_code == 200, f"Local media should be accessible: {full_url}"
                    print(f"✓ Local media accessible: {media_url}")
                elif media_url.startswith("http"):
                    # External URL - just verify format
                    print(f"✓ External media URL: {media_url}")
                    
            # Check author avatar
            if post.get("author") and post["author"].get("avatar"):
                avatar = post["author"]["avatar"]
                if avatar.startswith("/uploads/"):
                    api_path = avatar.replace('/uploads/', '/api/uploads/')
                    full_url = f"{BASE_URL}{api_path}"
                    file_response = requests.get(full_url)
                    assert file_response.status_code == 200, f"Author avatar should be accessible: {full_url}"
                    print(f"✓ Author avatar accessible: {avatar}")
    
    # ============== Artist Profile Image Tests ==============
    
    def test_artist_profile_has_avatar(self):
        """Test that artist profiles have avatar field"""
        # Get current user's profile
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        user = response.json()
        
        assert "avatar" in user, "User should have avatar field"
        assert user["avatar"] is not None, "Avatar should not be null"
        print(f"✓ User has avatar: {user['avatar']}")
        
        # Get artist by ID
        artist_response = self.session.get(f"{BASE_URL}/api/artists/{user['id']}")
        assert artist_response.status_code == 200
        artist = artist_response.json()
        
        assert "avatar" in artist, "Artist profile should have avatar"
        print(f"✓ Artist profile has avatar: {artist['avatar']}")
    
    def test_artists_list_has_avatars(self):
        """Test that artists list includes avatar URLs"""
        response = self.session.get(f"{BASE_URL}/api/artists")
        assert response.status_code == 200
        
        data = response.json()
        artists = data.get("artists", [])
        assert len(artists) > 0, "Should have artists"
        
        for artist in artists[:5]:  # Check first 5
            assert "avatar" in artist, f"Artist {artist.get('first_name')} should have avatar field"
            avatar = artist["avatar"]
            
            if avatar and avatar.startswith("/uploads/"):
                api_path = avatar.replace('/uploads/', '/api/uploads/')
                full_url = f"{BASE_URL}{api_path}"
                file_response = requests.get(full_url)
                assert file_response.status_code == 200, f"Avatar should be accessible: {full_url}"
                print(f"✓ Artist {artist['first_name']} avatar accessible: {avatar}")
            elif avatar and avatar.startswith("http"):
                print(f"✓ Artist {artist['first_name']} has external avatar: {avatar[:50]}...")
    
    # ============== Portfolio Image Tests ==============
    
    def test_portfolio_image_upload(self):
        """Test uploading image to portfolio"""
        img_buffer = self.create_test_image(300, 300)
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/portfolio/upload",
            headers=headers,
            files={"file": ("portfolio_image.png", img_buffer, "image/png")},
            data={
                "file_type": "image",
                "title": "Test Portfolio Image",
                "description": "Test description"
            }
        )
        
        assert response.status_code == 200, f"Portfolio upload failed: {response.status_code} - {response.text}"
        data = response.json()
        
        assert "url" in data, "Response should have url"
        assert data["url"].startswith("/uploads/images/"), f"URL should start with /uploads/images/, got: {data['url']}"
        print(f"✓ Portfolio image uploaded: {data['url']}")
        
        # Verify it's accessible via /api/uploads/
        api_path = data['url'].replace('/uploads/', '/api/uploads/')
        full_url = f"{BASE_URL}{api_path}"
        file_response = requests.get(full_url)
        assert file_response.status_code == 200, f"Portfolio image should be accessible: {full_url}"
        
        # Cleanup
        delete_response = self.session.delete(f"{BASE_URL}/api/portfolio/images/{data['id']}")
        assert delete_response.status_code == 200


class TestGetMediaUrlLogic:
    """Tests to verify getMediaUrl logic works correctly on backend responses"""
    
    def setup_method(self):
        """Setup test session"""
        self.session = requests.Session()
        
    def test_external_urls_unchanged(self):
        """Test that external URLs (http/https) are returned as-is"""
        # Get featured artists which have external avatar URLs
        response = self.session.get(f"{BASE_URL}/api/artists/featured")
        assert response.status_code == 200
        
        artists = response.json()
        for artist in artists:
            avatar = artist.get("avatar", "")
            if avatar.startswith("http"):
                # External URL should be complete
                assert "://" in avatar, f"External URL should be complete: {avatar}"
                print(f"✓ External URL preserved: {avatar[:60]}...")
    
    def test_local_uploads_have_correct_path(self):
        """Test that local uploads have /uploads/ prefix"""
        # Login and check user with uploaded avatar
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ARTIST_EMAIL,
            "password": ARTIST_PASSWORD
        })
        assert response.status_code == 200
        user = response.json()["user"]
        
        avatar = user.get("avatar", "")
        if avatar.startswith("/uploads/"):
            # Local upload should have correct path format
            assert avatar.startswith("/uploads/avatars/") or avatar.startswith("/uploads/images/"), \
                f"Local avatar should be in uploads folder: {avatar}"
            print(f"✓ Local upload path correct: {avatar}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
