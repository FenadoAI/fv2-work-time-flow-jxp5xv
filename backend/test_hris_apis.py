"""Test HRIS APIs"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8001/api"

def test_auth_and_leave_workflow():
    """Test complete HRIS workflow."""
    print("\n=== Testing HRIS APIs ===\n")

    # 1. Register users
    print("1. Registering users...")

    # Register admin
    admin_data = {
        "username": "admin_user",
        "email": "admin@company.com",
        "password": "admin123",
        "role": "admin"
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    print(f"   Admin registration: {resp.status_code}")
    if resp.status_code == 200:
        admin_token = resp.json()["token"]
        print(f"   Admin token: {admin_token[:20]}...")
    else:
        print(f"   Error: {resp.text}")
        return

    # Register manager
    manager_data = {
        "username": "manager_user",
        "email": "manager@company.com",
        "password": "manager123",
        "role": "manager"
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=manager_data)
    print(f"   Manager registration: {resp.status_code}")
    if resp.status_code == 200:
        manager_token = resp.json()["token"]
        print(f"   Manager token: {manager_token[:20]}...")
    else:
        print(f"   Error: {resp.text}")
        return

    # Register employee
    employee_data = {
        "username": "employee_user",
        "email": "employee@company.com",
        "password": "employee123",
        "role": "employee"
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=employee_data)
    print(f"   Employee registration: {resp.status_code}")
    if resp.status_code == 200:
        employee_token = resp.json()["token"]
        employee_id = resp.json()["user"]["id"]
        print(f"   Employee token: {employee_token[:20]}...")
        print(f"   Employee ID: {employee_id}")
    else:
        print(f"   Error: {resp.text}")
        return

    # 2. Test login
    print("\n2. Testing login...")
    login_data = {"username": "employee_user", "password": "employee123"}
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"   Login status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   Login successful for: {resp.json()['user']['username']}")

    # 3. Get current user info
    print("\n3. Getting current user info...")
    headers = {"Authorization": f"Bearer {employee_token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"   Get me status: {resp.status_code}")
    if resp.status_code == 200:
        user = resp.json()
        print(f"   Username: {user['username']}, Role: {user['role']}")
        print(f"   Leave balances: {json.dumps(user['leave_balances'], indent=6)}")

    # 4. Get leave balance
    print("\n4. Getting leave balance...")
    resp = requests.get(f"{BASE_URL}/leaves/balance", headers=headers)
    print(f"   Balance status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   Balances: {json.dumps(resp.json(), indent=6)}")

    # 5. Apply for leave
    print("\n5. Applying for leave...")
    start_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=9)).strftime("%Y-%m-%d")
    leave_request = {
        "leave_type": "cl",
        "start_date": start_date,
        "end_date": end_date,
        "reason": "Family vacation"
    }
    resp = requests.post(f"{BASE_URL}/leaves/apply", json=leave_request, headers=headers)
    print(f"   Apply leave status: {resp.status_code}")
    if resp.status_code == 200:
        leave = resp.json()
        leave_id = leave["id"]
        print(f"   Leave ID: {leave_id}")
        print(f"   Type: {leave['leave_type']}, Days: {leave['days_count']}, Status: {leave['status']}")
    else:
        print(f"   Error: {resp.text}")
        return

    # 6. Get employee's leave requests
    print("\n6. Getting employee's leave requests...")
    resp = requests.get(f"{BASE_URL}/leaves/my-requests", headers=headers)
    print(f"   My requests status: {resp.status_code}")
    if resp.status_code == 200:
        requests_list = resp.json()
        print(f"   Total requests: {len(requests_list)}")
        for req in requests_list:
            print(f"   - {req['leave_type'].upper()}: {req['start_date']} to {req['end_date']} ({req['status']})")

    # 7. Manager views pending leaves
    print("\n7. Manager viewing pending leaves...")
    manager_headers = {"Authorization": f"Bearer {manager_token}"}
    resp = requests.get(f"{BASE_URL}/leaves/pending", headers=manager_headers)
    print(f"   Pending leaves status: {resp.status_code}")
    if resp.status_code == 200:
        pending = resp.json()
        print(f"   Pending leaves: {len(pending)}")
        for leave in pending:
            print(f"   - {leave['employee_name']}: {leave['leave_type'].upper()} ({leave['days_count']} days)")

    # 8. Manager approves leave
    print("\n8. Manager approving leave...")
    approve_data = {"comments": "Approved - have a great vacation!"}
    resp = requests.put(f"{BASE_URL}/leaves/{leave_id}/approve", json=approve_data, headers=manager_headers)
    print(f"   Approve status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   Message: {resp.json()['message']}")

    # 9. Check updated balance
    print("\n9. Checking updated leave balance...")
    resp = requests.get(f"{BASE_URL}/leaves/balance", headers=headers)
    print(f"   Balance status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   Updated balances: {json.dumps(resp.json(), indent=6)}")

    # 10. Admin views all users
    print("\n10. Admin viewing all users...")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get(f"{BASE_URL}/users", headers=admin_headers)
    print(f"   Users status: {resp.status_code}")
    if resp.status_code == 200:
        users = resp.json()
        print(f"   Total users: {len(users)}")
        for user in users:
            print(f"   - {user['username']} ({user['role']})")

    # 11. Admin updates leave balance
    print("\n11. Admin updating employee's leave balance...")
    balance_update = {"leave_type": "el", "balance": 20.0}
    resp = requests.put(f"{BASE_URL}/users/{employee_id}/leave-balance", json=balance_update, headers=admin_headers)
    print(f"   Update balance status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   Message: {resp.json()['message']}")

    # 12. Get leave calendar
    print("\n12. Getting leave calendar...")
    resp = requests.get(f"{BASE_URL}/leaves/calendar", headers=headers)
    print(f"   Calendar status: {resp.status_code}")
    if resp.status_code == 200:
        calendar = resp.json()
        print(f"   Calendar entries: {len(calendar['calendar'])}")
        for entry in calendar['calendar']:
            print(f"   - {entry['employee_name']}: {entry['leave_type'].upper()} ({entry['start_date']} to {entry['end_date']})")

    # 13. Admin exports report
    print("\n13. Admin exporting leave report...")
    resp = requests.get(f"{BASE_URL}/leaves/report", headers=admin_headers)
    print(f"   Report status: {resp.status_code}")
    if resp.status_code == 200:
        report = resp.json()
        print(f"   Total requests in report: {report['total_requests']}")
        print(f"   Sample entries:")
        for entry in report['report'][:3]:
            print(f"   - {entry['employee_name']}: {entry['leave_type']} ({entry['status']})")

    print("\n=== All Tests Completed Successfully! ===\n")

if __name__ == "__main__":
    test_auth_and_leave_workflow()
