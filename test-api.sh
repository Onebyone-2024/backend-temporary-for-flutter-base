#!/bin/bash

# Wait for server to be ready
echo "Waiting for server to be ready..."
sleep 8

echo "Testing Send Message API..."
curl -v -X POST "http://localhost:3000/direct-chats/3c41f712-93a2-4f59-9a72-5dc24ff15eba/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"senderUuid":"550e8400-e29b-41d4-a716-446655440000","message":"Test Message"}' 2>&1 | tee /tmp/api-response.log

echo ""
echo "---Response saved to /tmp/api-response.log---"
