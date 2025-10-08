.PHONY: help up down seed import activate backup logs psql test test-instagram test-whatsapp test-google clean

# Default target
help:
	@echo "Multi-Platform Auto Response System"
	@echo ""
	@echo "Available commands:"
	@echo "  make up        - Start all services (PostgreSQL and n8n)"
	@echo "  make down      - Stop all services"
	@echo "  make seed      - Initialize database schema (runs automatically on first start)"
	@echo "  make import    - Import all n8n workflows from workflows/ directory"
	@echo "  make activate  - Activate all imported workflows"
	@echo "  make backup    - Backup database and workflows"
	@echo "  make logs      - Show logs from all services"
	@echo "  make psql      - Connect to PostgreSQL database"
	@echo "  make test      - Run essential test suite"
	@echo "  make test-instagram - Run Instagram DM tests only"
	@echo "  make test-whatsapp  - Run WhatsApp session tests only"
	@echo "  make test-google    - Run Google Reviews tests only"
	@echo "  make clean     - Clean up containers and volumes"

# Start all services
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo "Services started. n8n available at http://localhost:5678"

# Stop all services
down:
	@echo "Stopping services..."
	docker-compose down

# Initialize database schema (runs automatically on container start via docker-entrypoint-initdb.d)
seed:
	@echo "Initializing database schema..."
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Please copy .env.example to .env and configure it."; \
		exit 1; \
	fi
	@echo "Checking if PostgreSQL is running..."
	@docker-compose ps postgres | grep -q "Up" || (echo "PostgreSQL is not running. Please run 'make up' first." && exit 1)
	@echo "Running database schema setup..."
	@docker-compose exec -T postgres psql -U $(shell grep POSTGRES_USER .env | cut -d '=' -f2) -d $(shell grep POSTGRES_DB .env | cut -d '=' -f2) -f /docker-entrypoint-initdb.d/seed.sql
	@echo "Database schema initialized successfully!"

# Import workflows from workflows/ directory
import:
	@echo "Importing workflows..."
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Please copy .env.example to .env and configure it."; \
		exit 1; \
	fi
	@./scripts/import.sh

# Activate all workflows
activate:
	@echo "Activating workflows..."
	@./scripts/activate.sh

# Backup database and workflows
backup:
	@echo "Creating backup..."
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U $(shell grep POSTGRES_USER .env | cut -d '=' -f2) $(shell grep POSTGRES_DB .env | cut -d '=' -f2) > backups/db_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Database backup created in backups/"

# Show logs from all services
logs:
	docker-compose logs -f

# Connect to PostgreSQL database
psql:
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Please copy .env.example to .env and configure it."; \
		exit 1; \
	fi
	docker-compose exec postgres psql -U $(shell grep POSTGRES_USER .env | cut -d '=' -f2) -d $(shell grep POSTGRES_DB .env | cut -d '=' -f2)

# Run test suite
test:
	@echo "Running essential test suite..."
	@cd tests && npm install && npm test

# Run individual test suites
test-instagram:
	@echo "Running Instagram DM tests..."
	@cd tests && npm run test:instagram

test-whatsapp:
	@echo "Running WhatsApp session tests..."
	@cd tests && npm run test:whatsapp

test-google:
	@echo "Running Google Reviews tests..."
	@cd tests && npm run test:google

# Clean up containers and volumes
clean:
	@echo "Cleaning up..."
	docker-compose down -v
	docker system prune -f