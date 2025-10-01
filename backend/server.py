"""FastAPI server exposing AI agent endpoints."""

import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from starlette.middleware.cors import CORSMiddleware
import bcrypt
import jwt

from ai_agents.agents import AgentConfig, ChatAgent, SearchAgent


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "hris-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))


# ============= MODELS =============

# Auth Models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "employee"  # employee, manager, admin


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    leave_balances: Dict[str, float]
    manager_id: Optional[str] = None


class LoginResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse
    message: str = ""


class UpdateRoleRequest(BaseModel):
    role: str


class UpdateLeaveBalanceRequest(BaseModel):
    leave_type: str
    balance: float


# Leave Models
class LeaveRequest(BaseModel):
    leave_type: str  # cl, el, sl, wfh, compensatory
    start_date: str
    end_date: str
    reason: str


class LeaveResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    leave_type: str
    start_date: str
    end_date: str
    days_count: float
    reason: str
    status: str
    applied_date: str
    reviewed_by: Optional[str] = None
    reviewed_date: Optional[str] = None
    comments: Optional[str] = None


class LeaveActionRequest(BaseModel):
    comments: Optional[str] = None


class LeaveBalanceResponse(BaseModel):
    cl: float
    el: float
    sl: float
    wfh: float
    compensatory: float


# Employee Profile Models
class EmployeeProfileUpdate(BaseModel):
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    skills: Optional[List[str]] = None
    documents: Optional[Dict[str, str]] = None  # {doc_name: base64_content}
    profile_photo: Optional[str] = None  # base64 image


class EmployeeProfileResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    skills: Optional[List[str]] = None
    documents: Optional[Dict[str, str]] = None
    profile_photo: Optional[str] = None


# Attendance Models
class AttendanceCheckIn(BaseModel):
    notes: Optional[str] = None


class AttendanceCheckOut(BaseModel):
    notes: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    date: str
    check_in: str
    check_out: Optional[str] = None
    work_hours: Optional[float] = None
    status: str  # present, late, absent, half_day
    notes: Optional[str] = None


# Announcement Models
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "normal"  # low, normal, high, urgent
    target_roles: Optional[List[str]] = None  # None means all roles


class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    priority: str
    target_roles: Optional[List[str]] = None
    created_by: str
    created_by_name: str
    created_at: str
    is_active: bool


# Original Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ChatRequest(BaseModel):
    message: str
    agent_type: str = "chat"
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    agent_type: str
    capabilities: List[str]
    metadata: dict = Field(default_factory=dict)
    error: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


class SearchResponse(BaseModel):
    success: bool
    query: str
    summary: str
    search_results: Optional[dict] = None
    sources_count: int
    error: Optional[str] = None


def _ensure_db(request: Request):
    try:
        return request.app.state.db
    except AttributeError as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=503, detail="Database not ready") from exc


# ============= AUTH UTILITIES =============

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_jwt_token(user_id: str, username: str, role: str) -> str:
    """Create a JWT token for a user."""
    expiry = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "exp": expiry
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> Dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """Dependency to get current authenticated user."""
    token = credentials.credentials
    payload = decode_jwt_token(token)

    db = _ensure_db(request)
    user = await db.users.find_one({"_id": payload["user_id"]})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "id": user["_id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "leave_balances": user.get("leave_balances", {}),
        "manager_id": user.get("manager_id")
    }


async def require_role(required_roles: List[str]):
    """Dependency factory to require specific roles."""
    async def role_checker(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
        user = await get_current_user(request, credentials)
        if user["role"] not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker


def user_to_response(user: Dict) -> UserResponse:
    """Convert database user to UserResponse."""
    return UserResponse(
        id=user["_id"],
        username=user["username"],
        email=user["email"],
        role=user["role"],
        leave_balances=user.get("leave_balances", {"cl": 0, "el": 0, "sl": 0, "wfh": 0, "compensatory": 0}),
        manager_id=user.get("manager_id")
    )


def _get_agent_cache(request: Request) -> Dict[str, object]:
    if not hasattr(request.app.state, "agent_cache"):
        request.app.state.agent_cache = {}
    return request.app.state.agent_cache


async def _get_or_create_agent(request: Request, agent_type: str):
    cache = _get_agent_cache(request)
    if agent_type in cache:
        return cache[agent_type]

    config: AgentConfig = request.app.state.agent_config

    if agent_type == "search":
        cache[agent_type] = SearchAgent(config)
    elif agent_type == "chat":
        cache[agent_type] = ChatAgent(config)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown agent type '{agent_type}'")

    return cache[agent_type]


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv(ROOT_DIR / ".env")

    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME")

    if not mongo_url or not db_name:
        missing = [name for name, value in {"MONGO_URL": mongo_url, "DB_NAME": db_name}.items() if not value]
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

    client = AsyncIOMotorClient(mongo_url)

    try:
        app.state.mongo_client = client
        app.state.db = client[db_name]
        app.state.agent_config = AgentConfig()
        app.state.agent_cache = {}
        logger.info("AI Agents API starting up")
        yield
    finally:
        client.close()
        logger.info("AI Agents API shutdown complete")


app = FastAPI(
    title="AI Agents API",
    description="Minimal AI Agents API with LangGraph and MCP support",
    lifespan=lifespan,
)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/register", response_model=LoginResponse)
async def register_user(user_data: UserRegister, request: Request):
    """Register a new user."""
    db = _ensure_db(request)

    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    # Validate role
    if user_data.role not in ["employee", "manager", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Create user
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user_data.password)

    user = {
        "_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hashed_pwd,
        "role": user_data.role,
        "leave_balances": {
            "cl": 12.0,  # Default leave balances
            "el": 15.0,
            "sl": 10.0,
            "wfh": 24.0,
            "compensatory": 0.0
        },
        "manager_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.users.insert_one(user)

    # Generate token
    token = create_jwt_token(user_id, user_data.username, user_data.role)

    return LoginResponse(
        success=True,
        token=token,
        user=user_to_response(user),
        message="User registered successfully"
    )


@api_router.post("/auth/login", response_model=LoginResponse)
async def login_user(credentials: UserLogin, request: Request):
    """Login a user."""
    db = _ensure_db(request)

    user = await db.users.find_one({"username": credentials.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Generate token
    token = create_jwt_token(user["_id"], user["username"], user["role"])

    return LoginResponse(
        success=True,
        token=token,
        user=user_to_response(user),
        message="Login successful"
    )


@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(user: Dict = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(**user)


# ============= USER MANAGEMENT ENDPOINTS (ADMIN) =============

@api_router.get("/users", response_model=List[UserResponse])
async def get_all_users(request: Request, user: Dict = Depends(get_current_user)):
    """Get all users (Admin only)."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db = _ensure_db(request)
    users = await db.users.find().to_list(1000)
    return [user_to_response(u) for u in users]


@api_router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, role_data: UpdateRoleRequest, request: Request, user: Dict = Depends(get_current_user)):
    """Update user role (Admin only)."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if role_data.role not in ["employee", "manager", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    db = _ensure_db(request)
    result = await db.users.update_one({"_id": user_id}, {"$set": {"role": role_data.role}})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": "Role updated successfully"}


@api_router.put("/users/{user_id}/leave-balance")
async def update_user_leave_balance(
    user_id: str,
    balance_data: UpdateLeaveBalanceRequest,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Update user leave balance (Admin only)."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if balance_data.leave_type not in ["cl", "el", "sl", "wfh", "compensatory"]:
        raise HTTPException(status_code=400, detail="Invalid leave type")

    db = _ensure_db(request)
    result = await db.users.update_one(
        {"_id": user_id},
        {"$set": {f"leave_balances.{balance_data.leave_type}": balance_data.balance}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": "Leave balance updated successfully"}


# ============= LEAVE MANAGEMENT ENDPOINTS =============

def calculate_days(start_date: str, end_date: str) -> float:
    """Calculate number of days between two dates."""
    from datetime import datetime
    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    return (end - start).days + 1


def leave_to_response(leave: Dict, employee_name: str = "") -> LeaveResponse:
    """Convert database leave to LeaveResponse."""
    return LeaveResponse(
        id=leave["_id"],
        employee_id=leave["employee_id"],
        employee_name=employee_name,
        leave_type=leave["leave_type"],
        start_date=leave["start_date"],
        end_date=leave["end_date"],
        days_count=leave["days_count"],
        reason=leave["reason"],
        status=leave["status"],
        applied_date=leave["applied_date"],
        reviewed_by=leave.get("reviewed_by"),
        reviewed_date=leave.get("reviewed_date"),
        comments=leave.get("comments")
    )


@api_router.post("/leaves/apply", response_model=LeaveResponse)
async def apply_leave(leave_data: LeaveRequest, request: Request, user: Dict = Depends(get_current_user)):
    """Apply for leave."""
    db = _ensure_db(request)

    # Validate leave type
    if leave_data.leave_type not in ["cl", "el", "sl", "wfh", "compensatory"]:
        raise HTTPException(status_code=400, detail="Invalid leave type")

    # Calculate days
    days = calculate_days(leave_data.start_date, leave_data.end_date)

    # Check leave balance
    current_balance = user["leave_balances"].get(leave_data.leave_type, 0)
    if current_balance < days:
        raise HTTPException(status_code=400, detail=f"Insufficient {leave_data.leave_type.upper()} balance")

    # Create leave request
    leave_id = str(uuid.uuid4())
    leave = {
        "_id": leave_id,
        "employee_id": user["id"],
        "leave_type": leave_data.leave_type,
        "start_date": leave_data.start_date,
        "end_date": leave_data.end_date,
        "days_count": days,
        "reason": leave_data.reason,
        "status": "pending",
        "applied_date": datetime.now(timezone.utc).isoformat(),
        "reviewed_by": None,
        "reviewed_date": None,
        "comments": None
    }

    await db.leave_requests.insert_one(leave)

    return leave_to_response(leave, user["username"])


@api_router.get("/leaves/my-requests", response_model=List[LeaveResponse])
async def get_my_leave_requests(request: Request, user: Dict = Depends(get_current_user)):
    """Get employee's leave requests."""
    db = _ensure_db(request)
    leaves = await db.leave_requests.find({"employee_id": user["id"]}).sort("applied_date", -1).to_list(1000)
    return [leave_to_response(leave, user["username"]) for leave in leaves]


@api_router.get("/leaves/pending", response_model=List[LeaveResponse])
async def get_pending_leaves(request: Request, user: Dict = Depends(get_current_user)):
    """Get pending leave requests (Manager/Admin)."""
    if user["role"] not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Manager or Admin access required")

    db = _ensure_db(request)
    leaves = await db.leave_requests.find({"status": "pending"}).sort("applied_date", 1).to_list(1000)

    # Get employee names
    result = []
    for leave in leaves:
        employee = await db.users.find_one({"_id": leave["employee_id"]})
        employee_name = employee["username"] if employee else "Unknown"
        result.append(leave_to_response(leave, employee_name))

    return result


@api_router.put("/leaves/{leave_id}/approve")
async def approve_leave(
    leave_id: str,
    action_data: LeaveActionRequest,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Approve leave request (Manager/Admin)."""
    if user["role"] not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Manager or Admin access required")

    db = _ensure_db(request)
    leave = await db.leave_requests.find_one({"_id": leave_id})

    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if leave["status"] != "pending":
        raise HTTPException(status_code=400, detail="Leave request already processed")

    # Update leave request
    await db.leave_requests.update_one(
        {"_id": leave_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_by": user["id"],
                "reviewed_date": datetime.now(timezone.utc).isoformat(),
                "comments": action_data.comments
            }
        }
    )

    # Deduct leave balance
    employee = await db.users.find_one({"_id": leave["employee_id"]})
    if employee:
        current_balance = employee["leave_balances"].get(leave["leave_type"], 0)
        new_balance = max(0, current_balance - leave["days_count"])
        await db.users.update_one(
            {"_id": leave["employee_id"]},
            {"$set": {f"leave_balances.{leave['leave_type']}": new_balance}}
        )

    return {"success": True, "message": "Leave approved successfully"}


@api_router.put("/leaves/{leave_id}/reject")
async def reject_leave(
    leave_id: str,
    action_data: LeaveActionRequest,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Reject leave request (Manager/Admin)."""
    if user["role"] not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Manager or Admin access required")

    db = _ensure_db(request)
    leave = await db.leave_requests.find_one({"_id": leave_id})

    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if leave["status"] != "pending":
        raise HTTPException(status_code=400, detail="Leave request already processed")

    # Update leave request
    await db.leave_requests.update_one(
        {"_id": leave_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_by": user["id"],
                "reviewed_date": datetime.now(timezone.utc).isoformat(),
                "comments": action_data.comments
            }
        }
    )

    return {"success": True, "message": "Leave rejected successfully"}


@api_router.get("/leaves/balance", response_model=LeaveBalanceResponse)
async def get_leave_balance(user: Dict = Depends(get_current_user)):
    """Get current leave balance."""
    return LeaveBalanceResponse(**user["leave_balances"])


@api_router.get("/leaves/calendar")
async def get_leave_calendar(request: Request, user: Dict = Depends(get_current_user)):
    """Get leave calendar data."""
    db = _ensure_db(request)

    # Get all approved leaves
    leaves = await db.leave_requests.find({"status": "approved"}).to_list(1000)

    # Get employee names
    calendar_data = []
    for leave in leaves:
        employee = await db.users.find_one({"_id": leave["employee_id"]})
        employee_name = employee["username"] if employee else "Unknown"

        calendar_data.append({
            "id": leave["_id"],
            "employee_id": leave["employee_id"],
            "employee_name": employee_name,
            "leave_type": leave["leave_type"],
            "start_date": leave["start_date"],
            "end_date": leave["end_date"],
            "days_count": leave["days_count"]
        })

    return {"success": True, "calendar": calendar_data}


@api_router.get("/leaves/report")
async def get_leave_report(request: Request, user: Dict = Depends(get_current_user)):
    """Export leave report (Admin only)."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db = _ensure_db(request)

    # Get all leaves
    leaves = await db.leave_requests.find().sort("applied_date", -1).to_list(10000)

    # Get all users
    users = await db.users.find().to_list(10000)
    user_map = {u["_id"]: u["username"] for u in users}

    # Build report
    report = []
    for leave in leaves:
        employee_name = user_map.get(leave["employee_id"], "Unknown")
        reviewer_name = user_map.get(leave.get("reviewed_by"), "N/A") if leave.get("reviewed_by") else "N/A"

        report.append({
            "employee_name": employee_name,
            "leave_type": leave["leave_type"].upper(),
            "start_date": leave["start_date"],
            "end_date": leave["end_date"],
            "days_count": leave["days_count"],
            "status": leave["status"].upper(),
            "applied_date": leave["applied_date"],
            "reviewed_by": reviewer_name,
            "reviewed_date": leave.get("reviewed_date", "N/A"),
            "reason": leave["reason"],
            "comments": leave.get("comments", "N/A")
        })

    return {"success": True, "report": report, "total_requests": len(report)}


# ============= EMPLOYEE PROFILE ENDPOINTS =============

@api_router.get("/profile", response_model=EmployeeProfileResponse)
async def get_my_profile(request: Request, user: Dict = Depends(get_current_user)):
    """Get current user's profile."""
    db = _ensure_db(request)
    user_data = await db.users.find_one({"_id": user["id"]})

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    return EmployeeProfileResponse(
        id=user_data["_id"],
        username=user_data["username"],
        email=user_data["email"],
        role=user_data["role"],
        phone=user_data.get("phone"),
        emergency_contact=user_data.get("emergency_contact"),
        emergency_phone=user_data.get("emergency_phone"),
        address=user_data.get("address"),
        department=user_data.get("department"),
        designation=user_data.get("designation"),
        joining_date=user_data.get("joining_date"),
        date_of_birth=user_data.get("date_of_birth"),
        blood_group=user_data.get("blood_group"),
        skills=user_data.get("skills"),
        documents=user_data.get("documents"),
        profile_photo=user_data.get("profile_photo")
    )


@api_router.put("/profile", response_model=EmployeeProfileResponse)
async def update_my_profile(
    profile_data: EmployeeProfileUpdate,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Update current user's profile."""
    db = _ensure_db(request)

    # Build update dict with only provided fields
    update_fields = {}
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        if value is not None:
            update_fields[field] = value

    if update_fields:
        await db.users.update_one(
            {"_id": user["id"]},
            {"$set": update_fields}
        )

    # Fetch and return updated profile
    user_data = await db.users.find_one({"_id": user["id"]})

    return EmployeeProfileResponse(
        id=user_data["_id"],
        username=user_data["username"],
        email=user_data["email"],
        role=user_data["role"],
        phone=user_data.get("phone"),
        emergency_contact=user_data.get("emergency_contact"),
        emergency_phone=user_data.get("emergency_phone"),
        address=user_data.get("address"),
        department=user_data.get("department"),
        designation=user_data.get("designation"),
        joining_date=user_data.get("joining_date"),
        date_of_birth=user_data.get("date_of_birth"),
        blood_group=user_data.get("blood_group"),
        skills=user_data.get("skills"),
        documents=user_data.get("documents"),
        profile_photo=user_data.get("profile_photo")
    )


@api_router.get("/profile/{user_id}", response_model=EmployeeProfileResponse)
async def get_user_profile(
    user_id: str,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Get any user's profile (Manager/Admin can view all, Employee can view own)."""
    db = _ensure_db(request)

    # Check permissions
    if user["role"] not in ["manager", "admin"] and user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot view other user profiles")

    user_data = await db.users.find_one({"_id": user_id})

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    return EmployeeProfileResponse(
        id=user_data["_id"],
        username=user_data["username"],
        email=user_data["email"],
        role=user_data["role"],
        phone=user_data.get("phone"),
        emergency_contact=user_data.get("emergency_contact"),
        emergency_phone=user_data.get("emergency_phone"),
        address=user_data.get("address"),
        department=user_data.get("department"),
        designation=user_data.get("designation"),
        joining_date=user_data.get("joining_date"),
        date_of_birth=user_data.get("date_of_birth"),
        blood_group=user_data.get("blood_group"),
        skills=user_data.get("skills"),
        documents=user_data.get("documents"),
        profile_photo=user_data.get("profile_photo")
    )


# ============= ATTENDANCE ENDPOINTS =============

@api_router.post("/attendance/check-in", response_model=AttendanceResponse)
async def check_in(
    check_in_data: AttendanceCheckIn,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Check in for the day."""
    db = _ensure_db(request)

    today = datetime.now(timezone.utc).date().isoformat()

    # Check if already checked in today
    existing = await db.attendance.find_one({
        "employee_id": user["id"],
        "date": today
    })

    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")

    check_in_time = datetime.now(timezone.utc)

    # Determine status based on time (assuming 9 AM is start time)
    status = "present"
    if check_in_time.hour > 9 or (check_in_time.hour == 9 and check_in_time.minute > 15):
        status = "late"

    attendance_id = str(uuid.uuid4())
    attendance = {
        "_id": attendance_id,
        "employee_id": user["id"],
        "date": today,
        "check_in": check_in_time.isoformat(),
        "check_out": None,
        "work_hours": None,
        "status": status,
        "notes": check_in_data.notes
    }

    await db.attendance.insert_one(attendance)

    return AttendanceResponse(
        id=attendance_id,
        employee_id=user["id"],
        employee_name=user["username"],
        date=today,
        check_in=check_in_time.isoformat(),
        check_out=None,
        work_hours=None,
        status=status,
        notes=check_in_data.notes
    )


@api_router.post("/attendance/check-out", response_model=AttendanceResponse)
async def check_out(
    check_out_data: AttendanceCheckOut,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Check out for the day."""
    db = _ensure_db(request)

    today = datetime.now(timezone.utc).date().isoformat()

    # Find today's attendance
    attendance = await db.attendance.find_one({
        "employee_id": user["id"],
        "date": today
    })

    if not attendance:
        raise HTTPException(status_code=400, detail="No check-in found for today")

    if attendance.get("check_out"):
        raise HTTPException(status_code=400, detail="Already checked out today")

    check_out_time = datetime.now(timezone.utc)
    check_in_time = datetime.fromisoformat(attendance["check_in"])

    # Calculate work hours
    work_hours = (check_out_time - check_in_time).total_seconds() / 3600

    # Update status based on work hours
    status = attendance["status"]
    if work_hours < 4:
        status = "half_day"

    # Update attendance
    await db.attendance.update_one(
        {"_id": attendance["_id"]},
        {
            "$set": {
                "check_out": check_out_time.isoformat(),
                "work_hours": round(work_hours, 2),
                "status": status,
                "notes": check_out_data.notes if check_out_data.notes else attendance.get("notes")
            }
        }
    )

    return AttendanceResponse(
        id=attendance["_id"],
        employee_id=user["id"],
        employee_name=user["username"],
        date=today,
        check_in=attendance["check_in"],
        check_out=check_out_time.isoformat(),
        work_hours=round(work_hours, 2),
        status=status,
        notes=check_out_data.notes if check_out_data.notes else attendance.get("notes")
    )


@api_router.get("/attendance/my-records", response_model=List[AttendanceResponse])
async def get_my_attendance(
    request: Request,
    user: Dict = Depends(get_current_user),
    limit: int = 30
):
    """Get current user's attendance records."""
    db = _ensure_db(request)

    records = await db.attendance.find(
        {"employee_id": user["id"]}
    ).sort("date", -1).limit(limit).to_list(limit)

    return [
        AttendanceResponse(
            id=record["_id"],
            employee_id=record["employee_id"],
            employee_name=user["username"],
            date=record["date"],
            check_in=record["check_in"],
            check_out=record.get("check_out"),
            work_hours=record.get("work_hours"),
            status=record["status"],
            notes=record.get("notes")
        )
        for record in records
    ]


@api_router.get("/attendance/today")
async def get_today_attendance(request: Request, user: Dict = Depends(get_current_user)):
    """Get today's attendance status."""
    db = _ensure_db(request)

    today = datetime.now(timezone.utc).date().isoformat()

    attendance = await db.attendance.find_one({
        "employee_id": user["id"],
        "date": today
    })

    if not attendance:
        return {"checked_in": False, "date": today}

    return {
        "checked_in": True,
        "checked_out": attendance.get("check_out") is not None,
        "date": today,
        "check_in": attendance["check_in"],
        "check_out": attendance.get("check_out"),
        "work_hours": attendance.get("work_hours"),
        "status": attendance["status"]
    }


@api_router.get("/attendance/report")
async def get_attendance_report(
    request: Request,
    user: Dict = Depends(get_current_user),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get attendance report (Manager/Admin)."""
    if user["role"] not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Manager or Admin access required")

    db = _ensure_db(request)

    # Build query
    query = {}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}

    records = await db.attendance.find(query).sort("date", -1).to_list(10000)

    # Get all users
    users = await db.users.find().to_list(10000)
    user_map = {u["_id"]: u["username"] for u in users}

    # Build report
    report = []
    for record in records:
        employee_name = user_map.get(record["employee_id"], "Unknown")

        report.append({
            "employee_name": employee_name,
            "date": record["date"],
            "check_in": record["check_in"],
            "check_out": record.get("check_out", "N/A"),
            "work_hours": record.get("work_hours", 0),
            "status": record["status"].upper(),
            "notes": record.get("notes", "N/A")
        })

    return {"success": True, "report": report, "total_records": len(report)}


# ============= ANNOUNCEMENTS ENDPOINTS =============

@api_router.post("/announcements", response_model=AnnouncementResponse)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Create announcement (Admin only)."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db = _ensure_db(request)

    # Validate priority
    if announcement_data.priority not in ["low", "normal", "high", "urgent"]:
        raise HTTPException(status_code=400, detail="Invalid priority")

    # Validate target roles if provided
    if announcement_data.target_roles:
        for role in announcement_data.target_roles:
            if role not in ["employee", "manager", "admin"]:
                raise HTTPException(status_code=400, detail="Invalid target role")

    announcement_id = str(uuid.uuid4())
    announcement = {
        "_id": announcement_id,
        "title": announcement_data.title,
        "content": announcement_data.content,
        "priority": announcement_data.priority,
        "target_roles": announcement_data.target_roles,
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }

    await db.announcements.insert_one(announcement)

    return AnnouncementResponse(
        id=announcement_id,
        title=announcement_data.title,
        content=announcement_data.content,
        priority=announcement_data.priority,
        target_roles=announcement_data.target_roles,
        created_by=user["id"],
        created_by_name=user["username"],
        created_at=announcement["created_at"],
        is_active=True
    )


@api_router.get("/announcements", response_model=List[AnnouncementResponse])
async def get_announcements(request: Request, user: Dict = Depends(get_current_user)):
    """Get announcements visible to current user."""
    db = _ensure_db(request)

    # Get active announcements
    query = {"is_active": True}
    announcements = await db.announcements.find(query).sort("created_at", -1).to_list(100)

    # Filter by target roles
    filtered = []
    for announcement in announcements:
        target_roles = announcement.get("target_roles")

        # If no target roles, show to everyone
        if not target_roles or user["role"] in target_roles:
            # Get creator name
            creator = await db.users.find_one({"_id": announcement["created_by"]})
            creator_name = creator["username"] if creator else "System"

            filtered.append(AnnouncementResponse(
                id=announcement["_id"],
                title=announcement["title"],
                content=announcement["content"],
                priority=announcement["priority"],
                target_roles=announcement.get("target_roles"),
                created_by=announcement["created_by"],
                created_by_name=creator_name,
                created_at=announcement["created_at"],
                is_active=announcement["is_active"]
            ))

    return filtered


@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Delete/deactivate announcement (Admin only)."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db = _ensure_db(request)

    # Soft delete by setting is_active to False
    result = await db.announcements.update_one(
        {"_id": announcement_id},
        {"$set": {"is_active": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")

    return {"success": True, "message": "Announcement deleted successfully"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate, request: Request):
    db = _ensure_db(request)
    status_obj = StatusCheck(**input.model_dump())
    await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(request: Request):
    db = _ensure_db(request)
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(chat_request: ChatRequest, request: Request):
    try:
        agent = await _get_or_create_agent(request, chat_request.agent_type)
        response = await agent.execute(chat_request.message)

        return ChatResponse(
            success=response.success,
            response=response.content,
            agent_type=chat_request.agent_type,
            capabilities=agent.get_capabilities(),
            metadata=response.metadata,
            error=response.error,
        )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Error in chat endpoint")
        return ChatResponse(
            success=False,
            response="",
            agent_type=chat_request.agent_type,
            capabilities=[],
            error=str(exc),
        )


@api_router.post("/search", response_model=SearchResponse)
async def search_and_summarize(search_request: SearchRequest, request: Request):
    try:
        search_agent = await _get_or_create_agent(request, "search")
        search_prompt = (
            f"Search for information about: {search_request.query}. "
            "Provide a comprehensive summary with key findings."
        )
        result = await search_agent.execute(search_prompt, use_tools=True)

        if result.success:
            metadata = result.metadata or {}
            return SearchResponse(
                success=True,
                query=search_request.query,
                summary=result.content,
                search_results=metadata,
                sources_count=int(metadata.get("tool_run_count", metadata.get("tools_used", 0)) or 0),
            )

        return SearchResponse(
            success=False,
            query=search_request.query,
            summary="",
            sources_count=0,
            error=result.error,
        )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Error in search endpoint")
        return SearchResponse(
            success=False,
            query=search_request.query,
            summary="",
            sources_count=0,
            error=str(exc),
        )


@api_router.get("/agents/capabilities")
async def get_agent_capabilities(request: Request):
    try:
        search_agent = await _get_or_create_agent(request, "search")
        chat_agent = await _get_or_create_agent(request, "chat")

        return {
            "success": True,
            "capabilities": {
                "search_agent": search_agent.get_capabilities(),
                "chat_agent": chat_agent.get_capabilities(),
            },
        }
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Error getting capabilities")
        return {"success": False, "error": str(exc)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
