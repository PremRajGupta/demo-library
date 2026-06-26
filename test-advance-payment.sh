#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5000/api"
STUDENT_ID="TEST_$(date +%s)"  # Unique student ID based on timestamp

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Advance Payment System - Quick Test${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check if backend is running
echo -e "${YELLOW}1. Checking if backend is running...${NC}"
if curl -s "$API_URL/fees" > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}\n"
else
    echo -e "${RED}✗ Backend is not running on $API_URL${NC}"
    echo "Please start the backend: cd server && npm start"
    exit 1
fi

# Step 1: Create a test student
echo -e "${YELLOW}2. Creating test student...${NC}"
STUDENT_RESPONSE=$(curl -s -X POST "$API_URL/students" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Student - $STUDENT_ID\",
    \"fatherName\": \"Test Father\",
    \"mobile\": \"9876543210\",
    \"email\": \"test-$STUDENT_ID@example.com\",
    \"address\": \"Test Address\",
    \"course\": \"course1\",
    \"timeShift\": \"8hours\",
    \"feeAmount\": 500,
    \"joiningDate\": \"2024-06-04\"
  }")

STUDENT_DB_ID=$(echo $STUDENT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
STUDENT_DISPLAY_ID=$(echo $STUDENT_RESPONSE | grep -o '"studentId":"[^"]*' | cut -d'"' -f4)

if [ -z "$STUDENT_DB_ID" ]; then
    echo -e "${RED}✗ Failed to create student${NC}"
    echo "Response: $STUDENT_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Student created${NC}"
echo -e "  Student ID: ${YELLOW}$STUDENT_DISPLAY_ID${NC}"
echo -e "  DB ID: $STUDENT_DB_ID\n"

# Step 2: Create a payment
echo -e "${YELLOW}3. Creating advance payment (₹1500)...${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/fees" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentDisplayId\": \"$STUDENT_DISPLAY_ID\",
    \"amount\": 1500,
    \"month\": \"2024-06\",
    \"paymentMode\": \"cash\",
    \"notes\": \"Advance payment test\"
  }")

PAYMENT_ID=$(echo $PAYMENT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
RECEIPT_NUMBER=$(echo $PAYMENT_RESPONSE | grep -o '"receiptNumber":"[^"]*' | cut -d'"' -f4)

if [ -z "$PAYMENT_ID" ]; then
    echo -e "${RED}✗ Failed to create payment${NC}"
    echo "Response: $PAYMENT_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Payment created${NC}"
echo -e "  Payment ID: ${YELLOW}$PAYMENT_ID${NC}"
echo -e "  Receipt: $RECEIPT_NUMBER\n"

# Step 3: Mark as advance payment
echo -e "${YELLOW}4. Marking as advance payment...${NC}"
ADVANCE_RESPONSE=$(curl -s -X POST "$API_URL/fees/$PAYMENT_ID/mark-advance" \
  -H "Content-Type: application/json" \
  -d "{
    \"monthlyFee\": 500,
    \"advanceStartDate\": \"2024-06-04\",
    \"isAdvance\": true
  }")

MONTHS_COVERED=$(echo $ADVANCE_RESPONSE | grep -o '"monthsCovered":[0-9]*' | cut -d':' -f2)
VALID_UNTIL=$(echo $ADVANCE_RESPONSE | grep -o '"validUntilDate":"[^"]*' | cut -d'"' -f4 | cut -d'T' -f1)

if [ -z "$MONTHS_COVERED" ]; then
    echo -e "${RED}✗ Failed to mark as advance${NC}"
    echo "Response: $ADVANCE_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Marked as advance payment${NC}"
echo -e "  Months Covered: ${YELLOW}$MONTHS_COVERED${NC}"
echo -e "  Valid Until: $VALID_UNTIL\n"

# Step 4: Get payment validity
echo -e "${YELLOW}5. Getting payment validity...${NC}"
VALIDITY_RESPONSE=$(curl -s -X GET "$API_URL/fees/student/$STUDENT_DISPLAY_ID/validity")

HAS_ADVANCE=$(echo $VALIDITY_RESPONSE | grep -o '"hasAdvancePayment":[^,}]*' | cut -d':' -f2)
DAYS_REMAINING=$(echo $VALIDITY_RESPONSE | grep -o '"daysRemaining":[0-9]*' | cut -d':' -f2)
PAYMENT_STATUS=$(echo $VALIDITY_RESPONSE | grep -o '"paymentStatus":"[^"]*' | cut -d'"' -f4)

echo -e "${GREEN}✓ Validity retrieved${NC}"
echo -e "  Has Advance: ${YELLOW}$HAS_ADVANCE${NC}"
echo -e "  Days Remaining: $DAYS_REMAINING"
echo -e "  Status: $PAYMENT_STATUS"

# Determine status color
if [ "$PAYMENT_STATUS" = "valid" ]; then
    STATUS_COLOR="${GREEN}✓ VALID${NC}"
elif [ "$PAYMENT_STATUS" = "expiring-soon" ]; then
    STATUS_COLOR="${YELLOW}⚠ EXPIRING SOON${NC}"
else
    STATUS_COLOR="${RED}✗ EXPIRED${NC}"
fi

echo -e "\n${BLUE}======================================${NC}"
echo -e "${BLUE}Test Results Summary${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Student ID: ${YELLOW}$STUDENT_DISPLAY_ID${NC}"
echo -e "Amount Paid: ₹1500"
echo -e "Monthly Fee: ₹500"
echo -e "Months Covered: ${YELLOW}$MONTHS_COVERED${NC} (Expected: 3)"
echo -e "Valid Until: ${YELLOW}$VALID_UNTIL${NC} (Expected: 2024-09-04)"
echo -e "Days Remaining: ${YELLOW}$DAYS_REMAINING${NC} (Expected: ~92)"
echo -e "Payment Status: $STATUS_COLOR"

# Verify calculations
if [ "$MONTHS_COVERED" = "3" ] && [ "$PAYMENT_STATUS" = "valid" ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed!${NC}"
    exit 1
fi
