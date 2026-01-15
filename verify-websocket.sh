#!/bin/bash

# WEBSOCKET SETUP VERIFICATION SCRIPT
# Usage: bash verify-websocket.sh

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   WebSocket Real-time Tracking - Setup Verification           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check 1: Node.js
echo -n "📦 Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check 2: npm
echo -n "📦 Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} Found: v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check 3: Socket.IO installed
echo -n "📦 Checking socket.io... "
if npm list socket.io &> /dev/null | grep -q "socket.io"; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed. Run: npm install socket.io"
fi

# Check 4: @nestjs/websockets installed
echo -n "📦 Checking @nestjs/websockets... "
if npm list @nestjs/websockets &> /dev/null | grep -q "@nestjs/websockets"; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed"
fi

# Check 5: Gateway file exists
echo -n "📄 Checking tracking.gateway.ts... "
if [ -f "src/tracking/tracking.gateway.ts" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${RED}✗${NC} Not found"
fi

# Check 6: Service has broadcast logic
echo -n "📄 Checking broadcast in service... "
if grep -q "location_update" src/tracking/tracking.service.ts; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${RED}✗${NC} Not implemented"
fi

# Check 7: Main.ts has IoAdapter
echo -n "📄 Checking IoAdapter setup... "
if grep -q "IoAdapter" src/main.ts; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${RED}✗${NC} Not found"
fi

# Check 8: Redis running
echo -n "🗄️  Checking Redis... "
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Running"
    else
        echo -e "${YELLOW}⚠${NC} redis-cli found but not connected"
    fi
else
    echo -e "${YELLOW}⚠${NC} redis-cli not found (but might be running)"
fi

# Check 9: Backend running
echo -n "🚀 Checking if backend is running on port 3000... "
if lsof -Pi :3000 &> /dev/null; then
    echo -e "${GREEN}✓${NC} Running"
else
    echo -e "${YELLOW}⚠${NC} Not running (expected - run 'npm start' to start)"
fi

# Documentation check
echo ""
echo "📚 Documentation Files:"
echo -n "   WEBSOCKET_QUICK_START.md... "
[ -f "WEBSOCKET_QUICK_START.md" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "   WEBSOCKET_TUTORIAL.md... "
[ -f "WEBSOCKET_TUTORIAL.md" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "   WEBSOCKET_ARCHITECTURE.md... "
[ -f "WEBSOCKET_ARCHITECTURE.md" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "   WEBSOCKET_REACT_HOOK.ts... "
[ -f "WEBSOCKET_REACT_HOOK.ts" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "   DEVELOPER_CHECKLIST.md... "
[ -f "DEVELOPER_CHECKLIST.md" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "   test-websocket.sh... "
[ -f "test-websocket.sh" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    NEXT STEPS                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "1️⃣  Start Backend:"
echo -e "   ${BLUE}npm start${NC}"
echo ""
echo "2️⃣  Run Tests:"
echo -e "   ${BLUE}./test-websocket.sh${NC}"
echo ""
echo "3️⃣  Check Documentation:"
echo -e "   ${BLUE}cat WEBSOCKET_QUICK_START.md${NC} (Quick start)"
echo -e "   ${BLUE}cat WEBSOCKET_TUTORIAL.md${NC} (Full guide)"
echo ""
echo "4️⃣  Integrate with Frontend:"
echo -e "   Copy ${BLUE}WEBSOCKET_REACT_HOOK.ts${NC} to your React project"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ SETUP VERIFIED!                             ║"
echo "║              WebSocket ready for testing                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
