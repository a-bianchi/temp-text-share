package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/redis/go-redis/v9"
	"github.com/teris-io/shortid"
)

// TTL constants for different expiration times
const (
	TTL_1_MINUTE   = 1
	TTL_15_MINUTES = 15
	TTL_1_HOUR     = 60
	TTL_24_HOURS   = 1440 // 24 * 60 minutes
)

// Server configuration
const (
	MAX_RESTART_ATTEMPTS = 5
	RESTART_DELAY        = 5 * time.Second
)

// TextRequest represents the structure for saving text
type TextRequest struct {
	Content string `json:"content" binding:"required,min=1,max=10000"`
	Ttl     int    `json:"ttl" binding:"required,oneof=1 15 60 1440"`
}

// TextResponse represents the response with the generated ID
type TextResponse struct {
	ID        string `json:"id"`
	Content   string `json:"content"`
	Ttl       int    `json:"ttl"`
	CreatedAt string `json:"createdAt"`
}

// RedisClient is the Redis client
var redisClient *redis.Client

// ShortID generator
var sid *shortid.Shortid

// Server instance for graceful shutdown
var server *http.Server

// Restart counter
var restartCount int

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// initializeRedis initializes the Redis connection
func initializeRedis() error {
	// Get configuration from environment variables
	redisHost := getEnv("REDIS_HOST", "localhost")
	redisPort := getEnv("REDIS_PORT", "6379")
	redisPassword := getEnv("REDIS_PASSWORD", "")

	redisAddr := redisHost + ":" + redisPort

	redisClient = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       0, // Default database
	})

	// Verify connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("❌ Error connecting to Redis: %v", err)
		log.Println("Make sure Redis is running on localhost:6379")
		return err
	}

	log.Println("✅ Successfully connected to Redis")
	return nil
}

// initializeShortID initializes the short ID generator
func initializeShortID() {
	sid = shortid.MustNew(1, shortid.DefaultABC, 2345678901)
	log.Println("✅ ShortID generator initialized")
}

// panicRecovery middleware to handle panics gracefully
func panicRecovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			log.Printf("🚨 PANIC RECOVERED: %s", err)
		}

		log.Printf("🚨 Stack trace: %+v", recovered)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":     "Internal server error - server recovered from panic",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})

		// Trigger restart after panic
		go triggerRestart("panic recovery")
	})
}

// errorLogger middleware for detailed error logging
func errorLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		if param.StatusCode >= 400 {
			log.Printf("⚠️  HTTP Error: %s %s %d %s %s",
				param.Method,
				param.Path,
				param.StatusCode,
				param.Latency,
				param.ErrorMessage,
			)
		}
		return ""
	})
}

// triggerRestart initiates a server restart
func triggerRestart(reason string) {
	restartCount++

	if restartCount > MAX_RESTART_ATTEMPTS {
		log.Fatalf("🚨 Maximum restart attempts (%d) reached. Exiting...", MAX_RESTART_ATTEMPTS)
	}

	log.Printf("🔄 Restarting server (attempt %d/%d) due to: %s",
		restartCount, MAX_RESTART_ATTEMPTS, reason)

	// Graceful shutdown
	if server != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("⚠️  Error during graceful shutdown: %v", err)
		}
	}

	// Wait before restart
	time.Sleep(RESTART_DELAY)

	// Restart the server
	go startServer()
}

// startServer starts the HTTP server with error handling
func startServer() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("🚨 Server panic: %+v", r)
			triggerRestart("server panic")
		}
	}()

	// Initialize components
	if err := initializeRedis(); err != nil {
		log.Printf("❌ Failed to initialize Redis: %v", err)
		triggerRestart("Redis initialization failed")
		return
	}

	initializeShortID()

	// Configure Gin
	apiEnv := getEnv("API_ENV", "production")
	if apiEnv == "development" {
		gin.SetMode(gin.DebugMode)
		log.Println("🔧 Running in development mode")
	} else {
		gin.SetMode(gin.ReleaseMode)
		log.Println("🚀 Running in production mode")
	}

	router := gin.New()

	// Add recovery and logging middleware
	router.Use(panicRecovery())
	router.Use(errorLogger())

	// Basic CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Routes
	router.GET("/ping", healthCheck)
	router.POST("/text", saveText)
	router.GET("/text/:id", getText)

	// Add admin endpoint for testing
	router.GET("/admin/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":       "OK",
			"message":      "Admin test endpoint working",
			"restartCount": restartCount,
			"timestamp":    time.Now().UTC().Format(time.RFC3339),
		})
	})

	// Start server
	apiPort := getEnv("API_PORT", "8080")
	port := ":" + apiPort

	server = &http.Server{
		Addr:    port,
		Handler: router,
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📋 Available endpoints:")
	log.Printf("  POST /text - Save text")
	log.Printf("  GET  /text/:id - Get text by ID")
	log.Printf("  GET  /ping - Check API status")
	log.Printf("  GET  /admin/test - Admin test endpoint")

	// Start server in goroutine
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("❌ Server error: %v", err)
			triggerRestart("server error")
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("❌ Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server exited")
}

// saveText saves a text in Redis and returns a unique ID
func saveText(c *gin.Context) {
	var request TextRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		// Handle validation errors with more specific messages
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, fieldError := range validationErrors {
				switch fieldError.Tag() {
				case "required":
					if fieldError.Field() == "Content" {
						c.JSON(http.StatusBadRequest, gin.H{
							"error": "Content is required",
						})
					} else if fieldError.Field() == "Ttl" {
						c.JSON(http.StatusBadRequest, gin.H{
							"error": "TTL is required",
						})
					}
					return
				case "min":
					if fieldError.Field() == "Content" {
						c.JSON(http.StatusBadRequest, gin.H{
							"error": "Content must be at least 1 character long",
						})
					}
					return
				case "max":
					if fieldError.Field() == "Content" {
						c.JSON(http.StatusBadRequest, gin.H{
							"error": "Content cannot exceed 10,000 characters",
						})
					}
					return
				case "oneof":
					if fieldError.Field() == "Ttl" {
						c.JSON(http.StatusBadRequest, gin.H{
							"error": "TTL must be one of: 1 (1 minute), 15 (15 minutes), 60 (1 hour), 1440 (24 hours)",
						})
					}
					return
				}
			}
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	// Generate unique short ID
	id := sid.MustGenerate()

	// Get current timestamp in ISO format
	createdAt := time.Now().UTC().Format(time.RFC3339)

	// Save in Redis using a hash to store both content and TTL
	ctx := context.Background()
	pipe := redisClient.Pipeline()

	// Save the content, TTL, and creation timestamp in a hash
	pipe.HSet(ctx, id, map[string]interface{}{
		"content":   request.Content,
		"ttl":       request.Ttl,
		"createdAt": createdAt,
	})

	// Set expiration for the hash
	pipe.Expire(ctx, id, time.Duration(request.Ttl)*time.Minute)

	_, err := pipe.Exec(ctx)
	if err != nil {
		log.Printf("Error saving to Redis: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
		})
		return
	}

	response := TextResponse{
		ID:        id,
		Content:   request.Content,
		Ttl:       request.Ttl,
		CreatedAt: createdAt,
	}

	c.JSON(http.StatusCreated, response)
}

// getText retrieves a text from Redis by ID
func getText(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID required",
		})
		return
	}

	// Get from Redis hash
	ctx := context.Background()
	result, err := redisClient.HGetAll(ctx, id).Result()
	if err != nil {
		log.Printf("Error getting from Redis: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
		})
		return
	}

	// Check if the hash exists and has content
	if len(result) == 0 || result["content"] == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Text not found",
		})
		return
	}

	// Parse TTL from string to int
	ttl := 0
	if ttlStr, exists := result["ttl"]; exists && ttlStr != "" {
		// Convert string to int (we'll handle this properly)
		if ttlInt, err := strconv.Atoi(ttlStr); err == nil {
			ttl = ttlInt
		}
	}

	// Get creation timestamp
	createdAt := ""
	if createdAtStr, exists := result["createdAt"]; exists {
		createdAt = createdAtStr
	}

	response := TextResponse{
		ID:        id,
		Content:   result["content"],
		Ttl:       ttl,
		CreatedAt: createdAt,
	}

	c.JSON(http.StatusOK, response)
}

// healthCheck endpoint to verify the API is working
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "OK",
		"message": "pong",
	})
}

func main() {
	// Start the server
	startServer()
}
