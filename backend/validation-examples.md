# Validation Examples

This document shows how the text validation works in the API.

## Valid Requests

### ✅ Valid text (normal size)
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello world!", "ttl": 60}'
```

### ✅ Valid text (minimum size - 1 character)
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{"content": "a", "ttl": 1}'
```

### ✅ Valid text (maximum size - 10,000 characters)
```bash
# Create a 10,000 character string
LONG_TEXT=$(printf 'a%.0s' {1..10000})

curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"$LONG_TEXT\", \"ttl\": 1440}"
```

## Invalid Requests

### ❌ Empty content
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{"content": "", "ttl": 60}'
```

**Response:**
```json
{
  "error": "Content must be at least 1 character long"
}
```

### ❌ Missing content
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{"ttl": 60}'
```

**Response:**
```json
{
  "error": "Content is required"
}
```

### ❌ Content too long (> 10,000 characters)
```bash
# Create a 10,001 character string
TOO_LONG_TEXT=$(printf 'a%.0s' {1..10001})

curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"$TOO_LONG_TEXT\", \"ttl\": 60}"
```

**Response:**
```json
{
  "error": "Content cannot exceed 10,000 characters"
}
```

### ❌ Missing TTL
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello world!"}'
```

**Response:**
```json
{
  "error": "TTL is required"
}
```

### ❌ Invalid TTL value
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello world!", "ttl": 30}'
```

**Response:**
```json
{
  "error": "TTL must be one of: 1 (1 minute), 15 (15 minutes), 60 (1 hour), 1440 (24 hours)"
}
```

### ❌ Invalid JSON format
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello world!", "ttl": 60'
```

**Response:**
```json
{
  "error": "Invalid request format"
}
```

## Validation Rules

- **Content minimum length**: 1 character
- **Content maximum length**: 10,000 characters
- **Content required**: Yes
- **Content type**: String only
- **TTL required**: Yes
- **TTL values**: 1, 15, 60, 1440 (minutes)

## Error Codes

| Error | HTTP Status | Description |
|-------|-------------|-------------|
| Content is required | 400 | Missing content field |
| Content must be at least 1 character long | 400 | Empty string |
| Content cannot exceed 10,000 characters | 400 | String too long |
| TTL is required | 400 | Missing TTL field |
| TTL must be one of: 1 (1 minute), 15 (15 minutes), 60 (1 hour), 1440 (24 hours) | 400 | Invalid TTL value |
| Invalid request format | 400 | Malformed JSON | 