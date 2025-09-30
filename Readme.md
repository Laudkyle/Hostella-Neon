# Hostel Management API - Complete User Journey Guide

## 🏠 API Overview

A comprehensive hostel management system supporting multiple user roles (Students, Realtors) with features for hostel listings, room management, amenities, and search functionality.

---

## 👤 User Journey Flow

### Phase 1: User Registration & Authentication
### Phase 2: Role-Specific Profile Setup  
### Phase 3: Hostel Management (Realtors)
### Phase 4: Hostel Discovery & Search (Students)
### Phase 5: Advanced Features

---

## 🚀 Phase 1: User Registration & Authentication

### 1.1 Register as Realtor
**POST** `/api/auth/register`
```json
{
  "email": "realtor.john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "role": "realtor"
}
```

### 1.2 Register as Student
**POST** `/api/auth/register`
```json
{
  "email": "student.jane@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNumber": "+1234567891",
  "role": "student"
}
```

### 1.3 Verify OTP
**POST** `/api/auth/verify-otp`
```json
{
  "userId": 1,
  "otp": "123456"
}
```

### 1.4 Login
**POST** `/api/auth/login`
```json
{
  "email": "realtor.john@example.com",
  "password": "password123"
}
```

**Save the JWT token returned for authenticated requests**

---

## 👤 Phase 2: Role-Specific Profile Setup

### 2.1 Get User Profile (Both Roles)
**GET** `/api/users/me`  
*Headers: `Authorization: Bearer <token>`*

### 2.2 Update User Profile
**PUT** `/api/users/me`
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567899"
}
```

### 2.3 Realtor - Update Company
**PUT** `/api/realtors/company`
```json
{
  "companyName": "Premium Student Housing Inc."
}
```

### 2.4 Student - Update Enrollment
**PUT** `/api/students/enrollment`
```json
{
  "enrollmentDate": "2024-09-01"
}
```

---

## 🏢 Phase 3: Hostel Management (Realtor Journey)

### 3.1 Create Hostel
**POST** `/api/hostels`
```json
{
  "name": "University Heights Premium",
  "address": "123 College Avenue, Campus Town, CT 12345",
  "description": "Modern student accommodation with premium amenities, located just 5 minutes from campus. Features high-speed WiFi, study rooms, and 24/7 security.",
  "contact_email": "bookings@universityheights.com",
  "contact_phone": "+1-555-0101"
}
```

### 3.2 Create Another Hostel
**POST** `/api/hostels`
```json
{
  "name": "Campus Comfort Suites",
  "address": "456 Student Street, University City, UC 67890",
  "description": "Affordable and comfortable student housing with great community spaces and study areas.",
  "contact_email": "info@campuscomfort.com",
  "contact_phone": "+1-555-0102"
}
```

### 3.3 Add Rooms to Hostel 1
**POST** `/api/hostels/1/rooms`
```json
{
  "room_type": "single",
  "price_per_year": 5200.00,
  "quantity_available": 8
}
```

**POST** `/api/hostels/1/rooms`
```json
{
  "room_type": "double", 
  "price_per_year": 3800.00,
  "quantity_available": 12
}
```

**POST** `/api/hostels/1/rooms`
```json
{
  "room_type": "three",
  "price_per_year": 3000.00,
  "quantity_available": 6
}
```

**POST** `/api/hostels/1/rooms`
```json
{
  "room_type": "four",
  "price_per_year": 2400.00,
  "quantity_available": 10
}
```

### 3.4 Add Rooms to Hostel 2
**POST** `/api/hostels/2/rooms`
```json
{
  "room_type": "single",
  "price_per_year": 4800.00,
  "quantity_available": 6
}
```

**POST** `/api/hostels/2/rooms`
```json
{
  "room_type": "double",
  "price_per_year": 3400.00, 
  "quantity_available": 8
}
```

---

### 3.5 Create Amenities (One-time setup)

**POST** `/api/amenities`

You can create amenities individually or in bulk.

#### ➡️ Single amenity

```json
{
  "name": "WiFi"
}
```

#### ➡️ Multiple amenities

```json
[
  { "name": "WiFi" },
  { "name": "Swimming Pool" },
  { "name": "Gym" },
  { "name": "Laundry" },
  { "name": "Cafeteria" },
  { "name": "Security" },
  { "name": "Parking" },
  { "name": "Air Conditioning" },
  { "name": "Study Room" },
  { "name": "Game Room" }
]
```

✅ Both formats are supported.

* Sending an **object** creates a single amenity.
* Sending an **array of objects** creates multiple amenities in one request.

---

### 3.6 Add Amenities to Hostel 1

**POST** `/api/hostels/1/amenities`

```json
[
  { "amenity_id": 1, "is_available": true },   // WiFi
  { "amenity_id": 3, "is_available": true },   // Gym  
  { "amenity_id": 4, "is_available": true },   // Laundry
  { "amenity_id": 6, "is_available": true },   // Security
  { "amenity_id": 8, "is_available": true },   // Air Conditioning
  { "amenity_id": 9, "is_available": true }    // Study Room
]
```

---

### 3.7 Add Amenities to Hostel 2

**POST** `/api/hostels/2/amenities`

```json
[
  { "amenity_id": 1, "is_available": true },   // WiFi
  { "amenity_id": 4, "is_available": true },   // Laundry  
  { "amenity_id": 6, "is_available": true },   // Security
  { "amenity_id": 7, "is_available": true },   // Parking
  { "amenity_id": 9, "is_available": true }    // Study Room
]
```

---

### 3.8 View Realtor's Hostels
**GET** `/api/hostels/my-hostels`

### 3.9 Update Hostel Information
**PUT** `/api/hostels/1`
```json
{
  "name": "University Heights Elite",
  "description": "Recently upgraded with new furniture and faster internet. Now featuring a new game room!",
  "contact_phone": "+1-555-0199"
}
```

### 3.10 Update Room Pricing
**PUT** `/api/hostels/1/rooms/1`
```json
{
  "price_per_year": 5400.00,
  "quantity_available": 7
}
```

---

## 🔍 Phase 4: Hostel Discovery & Search (Student Journey)

*Switch to student token for these requests*

### 4.1 Browse All Hostels
**GET** `/api/hostels`

### 4.2 View Specific Hostel Details
**GET** `/api/hostels/1`

### 4.3 View Hostel Rooms
**GET** `/api/hostels/1/rooms`

### 4.4 View Hostel Amenities  
**GET** `/api/hostels/1/amenities`

### 4.5 Search Hostels by Room Type
**GET** `/api/search/hostels?roomType=single`

### 4.6 Search Hostels by Budget
**GET** `/api/search/hostels?maxPrice=3000`

### 4.7 Search Hostels with Specific Amenities
**GET** `/api/search/hostels?amenities=1&amenities=3&amenities=8`

### 4.8 Combined Search
**GET** `/api/search/hostels?roomType=double&maxPrice=4000&amenities=1&amenities=4`

### 4.9 Get Complete Hostel Details
**GET** `/api/search/hostels/1/details`

### 4.10 Browse All Available Amenities
**GET** `/api/amenities`

---

## ⚡ Phase 5: Advanced Features & Management

### 5.1 Update Room Availability
**PUT** `/api/hostels/1/rooms/1/quantity`
```json
{
  "quantity_available": 5
}
```

### 5.2 Remove Amenity from Hostel
**DELETE** `/api/hostels/1/amenities`
```json
{
  "amenity_id": 3
}
```

### 5.3 Delete Room
**DELETE** `/api/hostels/1/rooms/3`

### 5.4 Delete Hostel
**DELETE** `/api/hostels/2`

### 5.5 Get Hostels with Specific Amenity
**GET** `/api/amenities/1/hostels`

### 5.6 Update Amenity
**PUT** `/api/amenities/1`
```json
{
  "name": "High-Speed WiFi"
}
```

### 5.7 Delete User Account
**DELETE** `/api/users/me`

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Realtor Workflow
1. Register as realtor → Verify OTP → Login
2. Update company name → Create hostel → Add rooms → Add amenities
3. Update pricing → Manage availability → View listings

### Scenario 2: Complete Student Journey  
1. Register as student → Verify OTP → Login
2. Set enrollment date → Browse hostels → Use search filters
3. Compare amenities → Check room availability

### Scenario 3: Error Testing
- Student trying to create hostel (should fail)
- Invalid room types
- Negative prices/quantities
- Duplicate room types per hostel

### Scenario 4: Search & Filter Testing
- Price range filtering
- Room type combinations  
- Amenity-based searching
- Mixed criteria searches

---

## 🔐 Authentication Notes

- **All endpoints** except auth routes require JWT token
- **Realtor-only endpoints**: Hostel creation, room management, amenity assignment
- **Student endpoints**: Search, browsing, profile management
- **Public endpoints**: Hostel listings, amenity lists, search

---

## 📁 Postman Collection Structure

```
Hostel Management API/
├── Authentication/
│   ├── Register Realtor
│   ├── Register Student  
│   ├── Verify OTP
│   └── Login
├── Profile Management/
│   ├── Get Profile
│   ├── Update Profile
│   ├── Realtor Company
│   └── Student Enrollment
├── Hostel Management/
│   ├── Create Hostel
│   ├── My Hostels
│   ├── Update Hostel
│   └── Delete Hostel
├── Room Management/
│   ├── Add Rooms
│   ├── Update Rooms
│   ├── Update Quantity
│   └── Delete Rooms
├── Amenity Management/
│   ├── Create Amenities
│   ├── Assign to Hostels
│   ├── Remove from Hostels
│   └── Manage Amenities
├── Search & Discovery/
│   ├── Browse All
│   ├── Search Filters
│   ├── Hostel Details
│   └── Amenity Search
└── Advanced/
    ├── Bulk Operations
    ├── Error Testing
    └── Cleanup
```

This user journey covers the complete lifecycle from registration to advanced management, providing a realistic testing flow for your hostel management API!