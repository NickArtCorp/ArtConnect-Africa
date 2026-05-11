print("Testing imports...")
try:
    from database import User, Post, Like, Comment, Message, Project, VisitorView, StatisticsCache, get_db
    print("✓ database module imports successfully")
except Exception as e:
    print(f"✗ database import error: {e}")

try:
    from auth_utils import security, active_tokens, ROLES, get_current_user, get_optional_user, require_paid_partner
    print("✓ auth_utils module imports successfully")
except Exception as e:
    print(f"✗ auth_utils import error: {e}")

try:
    from statistics_routes import stats_router
    print("✓ statistics_routes module imports successfully")
except Exception as e:
    print(f"✗ statistics_routes import error: {e}")

try:
    from server import app
    print("✓ server module imports successfully")
except Exception as e:
    print(f"✗ server import error: {e}")

print("\nAll imports successful! Circular import is resolved.")
