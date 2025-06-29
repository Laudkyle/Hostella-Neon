Here's a comprehensive `README.md` documentation for your Hostella backend API:

```markdown
# Hostella Backend API Documentation

## Base URL
`https://hostella-neon.onrender.com`

## Authentication Endpoints

### 1. Register New User

**Endpoint**: `POST /api/auth/register/`

**Request Body**:
```json
{
    "email": "joekay0976@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "password": "SecurePassword123!",
    "role": "realtor"
}
```

**Successful Response** (201 Created):
```json
{
    "message": "Registration successful. Please check your email for OTP.",
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 5
}
```

**Notes**:
- Password must be strong (min 8 chars, special char, number)
- Role can be either "student" or "realtor"
- An OTP will be sent to the provided email

---

### 2. Verify OTP

**Endpoint**: `POST /api/auth/verify-otp/`

**Request Body**:
```json
{
    "userId": "4",
    "otp": "828845"
}
```

**Successful Response** (200 OK):
```json
{
    "message": "OTP verified successfully",
    "user": {
        "id": 4,
        "email": "joekay0976@gmail.com",
        "isVerified": true
    }
}
```

**Notes**:
- OTP expires after 15 minutes
- User must verify OTP before logging in

---

### 3. User Login

**Endpoint**: `POST /api/auth/login/`

**Request Body**:
```json
{
    "email": "freemanphilip12@gmail.com",
    "password": "SecurePassword123!"
}
```

**Successful Response** (200 OK):
```json
{
    "user": {
        "id": 4,
        "email": "joekay0976@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+1234567890",
        "role": "realtor",
        "isVerified": true,
        "createdAt": "2025-06-29T17:06:04.684Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes**:
- Token expires in 1 hour
- Include token in `Authorization` header for protected routes

---

## Error Responses

All error responses follow this format:
```json
{
    "error": "Descriptive error message",
    "details": "Additional details if available"
}
```

**Common Status Codes**:
- 400 Bad Request - Invalid input data
- 401 Unauthorized - Invalid credentials or missing token
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 500 Internal Server Error - Server-side error

---

## Technical Details

**Database**: Neon PostgreSQL (Serverless)
**Authentication**: JWT (JSON Web Tokens)
**Password Hashing**: bcryptjs
**OTP Expiry**: 15 minutes
**Token Expiry**: 1 hour

---

## Sample Usage Flow

1. **Register** → Receive OTP via email
2. **Verify OTP** → Activate account
3. **Login** → Receive JWT token
4. Use token to access protected endpoints

---

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Exceeding limit returns 429 status with message:
```json
{
    "error": "Too many requests from this IP, please try again later"
}
```

## CORS Policy
- Allowed origins: `http://localhost:3000` and any specified in `CLIENT_URL`
- Credentials allowed
```