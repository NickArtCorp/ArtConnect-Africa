"""
Test RBAC (Role-Based Access Control) for Feed and Statistics features
Tests:
- Artist can create posts, like, comment
- Institution CANNOT create posts, like, comment (403 Forbidden)
- Institution CAN view feed and access detailed statistics
- Artist CANNOT access detailed statistics (403 Forbidden)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ARTIST_EMAIL = "amara.diallo@artconnect.africa"
ARTIST_PASSWORD = "password123"
INSTITUTION_EMAIL = "culture@gov.sn"
INSTITUTION_PASSWORD = "institution123"
ADMIN_EMAIL = "admin@artconnect.africa"
ADMIN_PASSWORD = "admin123"


class TestHealthAndSetup:
    """Basic health checks"""
    
    def test_api_health(self):
        """Test API is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ API health check passed")
    
    def test_seed_data(self):
        """Ensure seed data exists"""
        response = requests.post(f"{BASE_URL}/api/seed")
        assert response.status_code == 200
        print("✓ Seed data check passed")


class TestArtistLogin:
    """Test artist authentication"""
    
    def test_artist_login(self):
        """Artist can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ARTIST_EMAIL,
            "password": ARTIST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "artist"
        print(f"✓ Artist login successful - Role: {data['user']['role']}")
        return data["token"]


class TestInstitutionLogin:
    """Test institution authentication"""
    
    def test_institution_login(self):
        """Institution can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": INSTITUTION_EMAIL,
            "password": INSTITUTION_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "institution"
        print(f"✓ Institution login successful - Role: {data['user']['role']}")
        return data["token"]


class TestFeedViewAccess:
    """Test that all users can view the feed"""
    
    def test_public_can_view_feed(self):
        """Public (unauthenticated) can view feed"""
        response = requests.get(f"{BASE_URL}/api/posts")
        assert response.status_code == 200
        posts = response.json()
        assert isinstance(posts, list)
        print(f"✓ Public can view feed - {len(posts)} posts found")
    
    def test_artist_can_view_feed(self):
        """Artist can view feed"""
        # Login as artist
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ARTIST_EMAIL,
            "password": ARTIST_PASSWORD
        })
        token = login_resp.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/posts",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        posts = response.json()
        assert isinstance(posts, list)
        print(f"✓ Artist can view feed - {len(posts)} posts found")
    
    def test_institution_can_view_feed(self):
        """Institution can view feed"""
        # Login as institution
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": INSTITUTION_EMAIL,
            "password": INSTITUTION_PASSWORD
        })
        token = login_resp.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/posts",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        posts = response.json()
        assert isinstance(posts, list)
        print(f"✓ Institution can view feed - {len(posts)} posts found")


class TestArtistCanInteract:
    """Test that artists CAN create posts, like, and comment"""
    
    @pytest.fixture
    def artist_token(self):
        """Get artist auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ARTIST_EMAIL,
            "password": ARTIST_PASSWORD
        })
        return response.json()["token"]
    
    def test_artist_can_create_post(self, artist_token):
        """Artist can create a text post"""
        response = requests.post(
            f"{BASE_URL}/api/posts",
            headers={"Authorization": f"Bearer {artist_token}"},
            json={
                "content_type": "text",
                "text_content": "TEST_RBAC: Artist test post for RBAC testing"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["content_type"] == "text"
        print(f"✓ Artist can create post - Post ID: {data['id']}")
        return data["id"]
    
    def test_artist_can_like_post(self, artist_token):
        """Artist can like a post"""
        # First get a post to like
        posts_resp = requests.get(f"{BASE_URL}/api/posts")
        posts = posts_resp.json()
        if not posts:
            pytest.skip("No posts available to like")
        
        post_id = posts[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/posts/{post_id}/like",
            headers={"Authorization": f"Bearer {artist_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "liked" in data
        print(f"✓ Artist can like post - Liked: {data['liked']}")
    
    def test_artist_can_comment(self, artist_token):
        """Artist can comment on a post"""
        # First get a post to comment on
        posts_resp = requests.get(f"{BASE_URL}/api/posts")
        posts = posts_resp.json()
        if not posts:
            pytest.skip("No posts available to comment on")
        
        post_id = posts[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/posts/{post_id}/comments",
            headers={"Authorization": f"Bearer {artist_token}"},
            json={"content": "TEST_RBAC: Artist test comment"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["content"] == "TEST_RBAC: Artist test comment"
        print(f"✓ Artist can comment - Comment ID: {data['id']}")


class TestInstitutionCannotInteract:
    """Test that institutions CANNOT create posts, like, or comment (403 Forbidden)"""
    
    @pytest.fixture
    def institution_token(self):
        """Get institution auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": INSTITUTION_EMAIL,
            "password": INSTITUTION_PASSWORD
        })
        return response.json()["token"]
    
    def test_institution_cannot_create_post(self, institution_token):
        """Institution CANNOT create a post - should get 403"""
        response = requests.post(
            f"{BASE_URL}/api/posts",
            headers={"Authorization": f"Bearer {institution_token}"},
            json={
                "content_type": "text",
                "text_content": "TEST_RBAC: Institution should not be able to post"
            }
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Institution correctly blocked from creating post - Status: {response.status_code}")
    
    def test_institution_cannot_like_post(self, institution_token):
        """Institution CANNOT like a post - should get 403"""
        # First get a post to try to like
        posts_resp = requests.get(f"{BASE_URL}/api/posts")
        posts = posts_resp.json()
        if not posts:
            pytest.skip("No posts available to test")
        
        post_id = posts[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/posts/{post_id}/like",
            headers={"Authorization": f"Bearer {institution_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Institution correctly blocked from liking post - Status: {response.status_code}")
    
    def test_institution_cannot_comment(self, institution_token):
        """Institution CANNOT comment on a post - should get 403"""
        # First get a post to try to comment on
        posts_resp = requests.get(f"{BASE_URL}/api/posts")
        posts = posts_resp.json()
        if not posts:
            pytest.skip("No posts available to test")
        
        post_id = posts[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/posts/{post_id}/comments",
            headers={"Authorization": f"Bearer {institution_token}"},
            json={"content": "TEST_RBAC: Institution should not be able to comment"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Institution correctly blocked from commenting - Status: {response.status_code}")


class TestStatisticsAccess:
    """Test statistics access based on role"""
    
    def test_public_can_view_overview_stats(self):
        """Public can view overview statistics"""
        response = requests.get(f"{BASE_URL}/api/statistics/overview")
        assert response.status_code == 200
        data = response.json()
        assert "total_artists" in data
        assert "by_sector" in data
        assert "by_subregion" in data
        print(f"✓ Public can view overview stats - Total artists: {data['total_artists']}")
    
    def test_artist_cannot_access_detailed_stats(self):
        """Artist CANNOT access detailed statistics - should get 403"""
        # Login as artist
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ARTIST_EMAIL,
            "password": ARTIST_PASSWORD
        })
        token = login_resp.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/statistics/detailed",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Artist correctly blocked from detailed stats - Status: {response.status_code}")
    
    def test_institution_can_access_detailed_stats(self):
        """Institution CAN access detailed statistics"""
        # Login as institution
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": INSTITUTION_EMAIL,
            "password": INSTITUTION_PASSWORD
        })
        token = login_resp.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/statistics/detailed",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "by_gender" in data
        assert "by_country" in data
        assert "activity" in data
        print(f"✓ Institution can access detailed stats - Gender data: {data['by_gender']}")
    
    def test_admin_can_access_detailed_stats(self):
        """Admin CAN access detailed statistics"""
        # Login as admin
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_resp.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/statistics/detailed",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "by_gender" in data
        print(f"✓ Admin can access detailed stats - Status: {response.status_code}")


class TestCommentsViewAccess:
    """Test that all users can view comments"""
    
    def test_public_can_view_comments(self):
        """Public can view comments on posts"""
        # Get a post first
        posts_resp = requests.get(f"{BASE_URL}/api/posts")
        posts = posts_resp.json()
        if not posts:
            pytest.skip("No posts available")
        
        post_id = posts[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/posts/{post_id}/comments")
        assert response.status_code == 200
        comments = response.json()
        assert isinstance(comments, list)
        print(f"✓ Public can view comments - {len(comments)} comments found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
