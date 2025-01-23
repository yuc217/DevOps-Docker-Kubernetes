#!/bin/sh

RANDOM_URL=$(curl -s -I https://en.wikipedia.org/wiki/Special:Random | grep -i 'location:' | awk '{print $2}' | tr -d '\r')

if [ -n "$RANDOM_URL" ]; then
    echo "Random URL: $RANDOM_URL"
    curl -X POST http://localhost:3000/todos \
       -H "Content-Type: application/json" \
       -d "{\"todo\": \"Read $RANDOM_URL\"}"
else
  echo "Failed to fetch random URL"
fi
