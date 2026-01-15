#!/bin/bash

# Job Tracking Backend API - CURL Test Commands
# Base URL: http://localhost:3000

BASE_URL="http://localhost:3000"
BEARER_TOKEN="your-jwt-token-here"

echo "======================================="
echo "Job Tracking Backend API - CURL Tests"
echo "======================================="
echo ""

# ========== HEALTH CHECK ==========
echo "1. Health Check"
echo "GET /health"
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# ========== AUTH ENDPOINTS ==========
echo "2. Register User"
echo "POST /auth/register"
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "fullName": "John Doe",
    "password": "securePassword123"
  }'
echo -e "\n\n"

echo "3. Login User"
echo "POST /auth/login"
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
echo -e "\n\n"

# ========== JOBS ENDPOINTS ==========
echo "4. Create Job"
echo "POST /jobs"
curl -X POST "$BASE_URL/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Deliver package to customer in Jakarta",
    "assignedTo": "123e4567-e89b-12d3-a456-426614174000",
    "pickup": {
      "address": "Warehouse, Jl. Sudirman No. 123, Jakarta",
      "lat": -6.2088,
      "lng": 106.8456
    },
    "delivery": {
      "address": "Customer Office, Jl. Gatot Subroto No. 456, Jakarta",
      "lat": -6.2250,
      "lng": 106.7990,
      "polyline": "enc:{wsiFljiiBrB~A...",
      "distanceKm": 5.2,
      "estimateDuration": 15
    }
  }'
echo -e "\n\n"

echo "5. Get All Jobs"
echo "GET /jobs"
curl -X GET "$BASE_URL/jobs" \
  -H "Content-Type: application/json"
echo -e "\n\n"

echo "6. Get Job Details"
echo "GET /jobs/{jobUuid}"
echo "Note: Replace {jobUuid} with actual job UUID from create response"
curl -X GET "$BASE_URL/jobs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json"
echo -e "\n\n"

echo "7. Start Job"
echo "POST /jobs/{jobUuid}/start"
curl -X POST "$BASE_URL/jobs/550e8400-e29b-41d4-a716-446655440000/start" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -6.2150,
    "lng": 106.8200
  }'
echo -e "\n\n"

echo "8. Delete Job"
echo "DELETE /jobs/{jobUuid}"
curl -X DELETE "$BASE_URL/jobs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# ========== TRACKING ENDPOINTS ==========
echo "9. Push Location"
echo "POST /tracking/push-location"
curl -X POST "$BASE_URL/tracking/push-location" \
  -H "Content-Type: application/json" \
  -d '{
    "jobUuid": "550e8400-e29b-41d4-a716-446655440000",
    "lat": -6.2160,
    "lng": 106.8220
  }'
echo -e "\n\n"

echo "10. Get Current Location"
echo "GET /tracking/{jobUuid}/location"
curl -X GET "$BASE_URL/tracking/550e8400-e29b-41d4-a716-446655440000/location" \
  -H "Content-Type: application/json"
echo -e "\n\n"

echo "======================================="
echo "All tests completed!"
echo "======================================="
