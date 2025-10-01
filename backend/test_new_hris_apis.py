"""Test script for new HRIS API endpoints."""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Get base URL from environment or use default
BASE_URL = os.getenv("REACT_APP_API_URL", "http://localhost:8001")
API_URL = f"{BASE_URL}/api"

# Test credentials
ADMIN_CREDENTIALS = {"username": "admin_test", "email": "admin@test.com", "password": "admin123", "role": "admin"}
EMPLOYEE_CREDENTIALS = {"username": "emp_test", "email": "emp@test.com", "password": "emp123", "role": "employee"}

def test_new_hris_features():
    """Test all new HRIS features."""
    print("=" * 60)
    print("Testing New HRIS Features")
    print("=" * 60)

    # 1. Register Admin
    print("\n1. Registering Admin...")
    try:
        response = requests.post(f"{API_URL}/auth/register", json=ADMIN_CREDENTIALS)
        if response.status_code == 200:
            admin_data = response.json()
            admin_token = admin_data["token"]
            admin_id = admin_data["user"]["id"]
            print(f"✓ Admin registered successfully: {admin_data['user']['username']}")
        else:
            # Try login if already exists
            response = requests.post(f"{API_URL}/auth/login", json={
                "username": ADMIN_CREDENTIALS["username"],
                "password": ADMIN_CREDENTIALS["password"]
            })
            admin_data = response.json()
            admin_token = admin_data["token"]
            admin_id = admin_data["user"]["id"]
            print(f"✓ Admin logged in: {admin_data['user']['username']}")
    except Exception as e:
        print(f"✗ Admin registration/login failed: {e}")
        return

    # 2. Register Employee
    print("\n2. Registering Employee...")
    try:
        response = requests.post(f"{API_URL}/auth/register", json=EMPLOYEE_CREDENTIALS)
        if response.status_code == 200:
            emp_data = response.json()
            emp_token = emp_data["token"]
            emp_id = emp_data["user"]["id"]
            print(f"✓ Employee registered successfully: {emp_data['user']['username']}")
        else:
            # Try login if already exists
            response = requests.post(f"{API_URL}/auth/login", json={
                "username": EMPLOYEE_CREDENTIALS["username"],
                "password": EMPLOYEE_CREDENTIALS["password"]
            })
            emp_data = response.json()
            emp_token = emp_data["token"]
            emp_id = emp_data["user"]["id"]
            print(f"✓ Employee logged in: {emp_data['user']['username']}")
    except Exception as e:
        print(f"✗ Employee registration/login failed: {e}")
        return

    # 3. Test Employee Profile Management
    print("\n" + "=" * 60)
    print("EMPLOYEE PROFILE MANAGEMENT")
    print("=" * 60)

    # 3a. Update Employee Profile
    print("\n3a. Updating employee profile...")
    try:
        profile_update = {
            "phone": "+1234567890",
            "emergency_contact": "John Doe",
            "emergency_phone": "+0987654321",
            "address": "123 Main St, City, Country",
            "department": "Engineering",
            "designation": "Software Engineer",
            "joining_date": "2024-01-15",
            "date_of_birth": "1995-05-20",
            "blood_group": "O+",
            "skills": ["Python", "FastAPI", "React", "MongoDB"]
        }

        headers = {"Authorization": f"Bearer {emp_token}"}
        response = requests.put(f"{API_URL}/profile", json=profile_update, headers=headers)

        if response.status_code == 200:
            profile = response.json()
            print(f"✓ Profile updated successfully")
            print(f"  Department: {profile.get('department')}")
            print(f"  Designation: {profile.get('designation')}")
            print(f"  Skills: {', '.join(profile.get('skills', []))}")
        else:
            print(f"✗ Profile update failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Profile update failed: {e}")

    # 3b. Get Employee Profile
    print("\n3b. Getting employee profile...")
    try:
        headers = {"Authorization": f"Bearer {emp_token}"}
        response = requests.get(f"{API_URL}/profile", headers=headers)

        if response.status_code == 200:
            profile = response.json()
            print(f"✓ Profile retrieved successfully")
            print(f"  Name: {profile.get('username')}")
            print(f"  Email: {profile.get('email')}")
            print(f"  Department: {profile.get('department')}")
        else:
            print(f"✗ Profile retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Profile retrieval failed: {e}")

    # 4. Test Attendance Management
    print("\n" + "=" * 60)
    print("ATTENDANCE MANAGEMENT")
    print("=" * 60)

    # 4a. Check In
    print("\n4a. Employee checking in...")
    try:
        headers = {"Authorization": f"Bearer {emp_token}"}
        response = requests.post(
            f"{API_URL}/attendance/check-in",
            json={"notes": "Starting work for today"},
            headers=headers
        )

        if response.status_code == 200:
            attendance = response.json()
            print(f"✓ Check-in successful")
            print(f"  Date: {attendance.get('date')}")
            print(f"  Check-in: {attendance.get('check_in')}")
            print(f"  Status: {attendance.get('status')}")
        else:
            print(f"✗ Check-in failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Check-in failed: {e}")

    # 4b. Get Today's Attendance
    print("\n4b. Getting today's attendance...")
    try:
        headers = {"Authorization": f"Bearer {emp_token}"}
        response = requests.get(f"{API_URL}/attendance/today", headers=headers)

        if response.status_code == 200:
            attendance = response.json()
            print(f"✓ Attendance retrieved successfully")
            print(f"  Checked in: {attendance.get('checked_in')}")
            print(f"  Date: {attendance.get('date')}")
        else:
            print(f"✗ Attendance retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Attendance retrieval failed: {e}")

    # 4c. Check Out
    print("\n4c. Employee checking out...")
    try:
        headers = {"Authorization": f"Bearer {emp_token}"}
        response = requests.post(
            f"{API_URL}/attendance/check-out",
            json={"notes": "End of day"},
            headers=headers
        )

        if response.status_code == 200:
            attendance = response.json()
            print(f"✓ Check-out successful")
            print(f"  Check-out: {attendance.get('check_out')}")
            print(f"  Work hours: {attendance.get('work_hours')}")
            print(f"  Status: {attendance.get('status')}")
        else:
            print(f"✗ Check-out failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Check-out failed: {e}")

    # 4d. Get Attendance Records
    print("\n4d. Getting attendance records...")
    try:
        headers = {"Authorization": f"Bearer {emp_token}"}
        response = requests.get(f"{API_URL}/attendance/my-records", headers=headers)

        if response.status_code == 200:
            records = response.json()
            print(f"✓ Attendance records retrieved: {len(records)} records")
            if records:
                print(f"  Latest record: {records[0].get('date')} - {records[0].get('status')}")
        else:
            print(f"✗ Attendance records retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Attendance records retrieval failed: {e}")

    # 4e. Admin Gets Attendance Report
    print("\n4e. Admin getting attendance report...")
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/attendance/report", headers=headers)

        if response.status_code == 200:
            report = response.json()
            print(f"✓ Attendance report retrieved: {report.get('total_records')} records")
        else:
            print(f"✗ Attendance report failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Attendance report failed: {e}")

    # 5. Test Announcements
    print("\n" + "=" * 60)
    print("ANNOUNCEMENTS")
    print("=" * 60)

    # 5a. Admin Creates Announcement
    print("\n5a. Admin creating announcement...")
    try:
        announcement_data = {
            "title": "Company Holiday Notice",
            "content": "All offices will be closed on October 15th for the company anniversary celebration.",
            "priority": "high",
            "target_roles": None  # All roles
        }

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{API_URL}/announcements",
            json=announcement_data,
            headers=headers
        )

        if response.status_code == 200:
            announcement = response.json()
            announcement_id = announcement["id"]
            print(f"✓ Announcement created successfully")
            print(f"  Title: {announcement.get('title')}")
            print(f"  Priority: {announcement.get('priority')}")
        else:
            print(f"✗ Announcement creation failed: {response.status_code} - {response.text}")
            announcement_id = None
    except Exception as e:
        print(f"✗ Announcement creation failed: {e}")
        announcement_id = None

    # 5b. Admin Creates Role-Specific Announcement
    print("\n5b. Admin creating role-specific announcement...")
    try:
        announcement_data = {
            "title": "Engineering Team Meeting",
            "content": "All engineers please attend the sprint planning meeting on Monday at 10 AM.",
            "priority": "normal",
            "target_roles": ["employee"]
        }

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(
            f"{API_URL}/announcements",
            json=announcement_data,
            headers=headers
        )

        if response.status_code == 200:
            announcement = response.json()
            print(f"✓ Role-specific announcement created")
            print(f"  Target roles: {announcement.get('target_roles')}")
        else:
            print(f"✗ Announcement creation failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Announcement creation failed: {e}")

    # 5c. Employee Gets Announcements
    print("\n5c. Employee getting announcements...")
    try:
        headers = {"Authorization": f"Bearer {emp_token}"}
        response = requests.get(f"{API_URL}/announcements", headers=headers)

        if response.status_code == 200:
            announcements = response.json()
            print(f"✓ Announcements retrieved: {len(announcements)} announcements")
            for ann in announcements:
                print(f"  - {ann.get('title')} [{ann.get('priority')}]")
        else:
            print(f"✗ Announcements retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Announcements retrieval failed: {e}")

    # 5d. Admin Deletes Announcement
    if announcement_id:
        print("\n5d. Admin deleting announcement...")
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.delete(
                f"{API_URL}/announcements/{announcement_id}",
                headers=headers
            )

            if response.status_code == 200:
                print(f"✓ Announcement deleted successfully")
            else:
                print(f"✗ Announcement deletion failed: {response.status_code}")
        except Exception as e:
            print(f"✗ Announcement deletion failed: {e}")

    print("\n" + "=" * 60)
    print("All new HRIS feature tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    test_new_hris_features()
