# TTL Constants

This document describes the available TTL (Time To Live) options for text storage.

## Available TTL Values

| Value | Duration | Description |
|-------|----------|-------------|
| `1`   | 1 minute | Very short term storage |
| `15`  | 15 minutes | Short term storage |
| `60`  | 1 hour | Medium term storage |
| `1440` | 24 hours | Long term storage |

## Usage Examples

### 1 Minute TTL
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This text will expire in 1 minute",
    "ttl": 1
  }'
```

### 15 Minutes TTL
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This text will expire in 15 minutes",
    "ttl": 15
  }'
```

### 1 Hour TTL
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This text will expire in 1 hour",
    "ttl": 60
  }'
```

### 24 Hours TTL
```bash
curl -X POST http://localhost:8080/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This text will expire in 24 hours",
    "ttl": 1440
  }'
```

## Response Format

When you save text, the response includes the TTL value:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Your text content here",
  "ttl": 60
}
```

When you retrieve text, the TTL field will be `0` since it's not stored in Redis:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Your text content here",
  "ttl": 0
}
```

## Validation

- TTL is **required** in the request
- Only the values `1`, `15`, `60`, and `1440` are accepted
- Any other value will return a validation error

## Error Messages

| Error | Description |
|-------|-------------|
| `"TTL is required"` | Missing TTL field |
| `"TTL must be one of: 1 (1 minute), 15 (15 minutes), 60 (1 hour), 1440 (24 hours)"` | Invalid TTL value |

## Implementation Details

The TTL values are stored in minutes in Redis. The constants are defined in the code as:

```go
const (
    TTL_1_MINUTE   = 1
    TTL_15_MINUTES = 15
    TTL_1_HOUR     = 60
    TTL_24_HOURS   = 1440 // 24 * 60 minutes
)
``` 