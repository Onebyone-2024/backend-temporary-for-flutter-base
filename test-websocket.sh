#!/bin/bash

# WebSocket Testing Script
# Usage: bash test-websocket.sh

BACKEND_URL="http://localhost:3000"
JOB_UUID="1a8b75e0-2700-4dc8-9716-3c37b8885372"

echo "🚀 WebSocket Testing Script"
echo "================================"
echo "Backend: $BACKEND_URL"
echo "Job UUID: $JOB_UUID"
echo ""

# Check if backend is running
echo "📡 Checking backend connection..."
if ! curl -s $BACKEND_URL/api > /dev/null; then
    echo "❌ Backend not responding on $BACKEND_URL"
    echo "   Make sure to run: npm start"
    exit 1
fi
echo "✅ Backend is running"
echo ""

# Function to send location
send_location() {
    local lat=$1
    local lng=$2
    echo "📍 Sending location: lat=$lat, lng=$lng"
    
    curl -X POST "$BACKEND_URL/tracking/push-location" \
        -H "Content-Type: application/json" \
        -d "{
            \"jobUuid\": \"$JOB_UUID\",
            \"lat\": $lat,
            \"lng\": $lng
        }" \
        -s | jq '.'
    
    echo ""
}

# Function to get current location from Redis
get_location() {
    echo "📍 Current location from Redis:"
    curl -s "$BACKEND_URL/tracking/$JOB_UUID/location" | jq '.'
    echo ""
}

# Menu
echo "Choose test option:"
echo "1. Send single location"
echo "2. Send multiple locations (simulate movement)"
echo "3. Get current location from Redis"
echo "4. Continuous send (every 5 sec, like driver)"
echo ""
read -p "Enter option (1-4): " option

case $option in
    1)
        read -p "Enter latitude: " lat
        read -p "Enter longitude: " lng
        send_location $lat $lng
        get_location
        ;;
    2)
        echo "📍 Simulating movement..."
        # Route: -6.2155 to -6.2200, 106.82 to 106.85
        send_location -6.2155 106.82
        sleep 2
        send_location -6.2170 106.8210
        sleep 2
        send_location -6.2185 106.8220
        sleep 2
        send_location -6.2200 106.85
        get_location
        ;;
    3)
        get_location
        ;;
    4)
        echo "📍 Continuous send (Ctrl+C to stop)"
        echo "In browser console, run:"
        echo "  const socket = io('$BACKEND_URL');"
        echo "  socket.on('connect', () => {"
        echo "    socket.emit('join_job_tracking', {jobId: '$JOB_UUID'});"
        echo "  });"
        echo "  socket.on('location_update', (data) => console.log('📍', data));"
        echo ""
        
        counter=0
        while true; do
            counter=$((counter + 1))
            lat=$(echo "-6.2155 + $counter * 0.0001" | bc)
            lng=$(echo "106.82 + $counter * 0.0001" | bc)
            
            echo "[$counter] Sending location: lat=$lat, lng=$lng"
            curl -X POST "$BACKEND_URL/tracking/push-location" \
                -H "Content-Type: application/json" \
                -d "{
                    \"jobUuid\": \"$JOB_UUID\",
                    \"lat\": $lat,
                    \"lng\": $lng
                }" \
                -s > /dev/null
            
            echo "   ✅ Sent (check browser console for location_update)"
            sleep 5
        done
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "================================"
echo "✅ Test completed!"
echo ""
echo "📚 For more info, read:"
echo "   - WEBSOCKET_QUICK_START.md"
echo "   - WEBSOCKET_TUTORIAL.md"
echo "   - IMPLEMENTATION_SUMMARY.md"
