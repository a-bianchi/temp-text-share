FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Compile the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final image
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the compiled binary
COPY --from=builder /app/main .

# Expose port
EXPOSE 8009

# Run the application
CMD ["./main"] 