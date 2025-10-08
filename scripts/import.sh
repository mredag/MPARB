#!/bin/bash

# Multi-Platform Auto Response System - Workflow Import Script
# This script imports all n8n workflows from the workflows/ directory

set -e  # Exit on any error

# Configuration
N8N_HOST="${N8N_HOST:-localhost}"
N8N_PORT="${N8N_PORT:-5678}"
N8N_PROTOCOL="${N8N_PROTOCOL:-http}"
N8N_URL="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
WORKFLOWS_DIR="./workflows"
MAX_RETRIES=30
RETRY_DELAY=2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if n8n is running and accessible
check_n8n_health() {
    local retries=0
    log_info "Checking n8n health at ${N8N_URL}..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s -f "${N8N_URL}/healthz" > /dev/null 2>&1; then
            log_success "n8n is healthy and ready"
            return 0
        fi
        
        retries=$((retries + 1))
        log_warning "n8n not ready yet (attempt $retries/$MAX_RETRIES), waiting ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    done
    
    log_error "n8n is not accessible after $MAX_RETRIES attempts"
    log_error "Please ensure n8n is running with 'make up'"
    return 1
}

# Get n8n authentication cookie
get_auth_cookie() {
    log_info "Checking n8n authentication..."
    
    # Try to access the API without authentication first
    if curl -s -f "${N8N_URL}/rest/login" > /dev/null 2>&1; then
        log_info "n8n requires authentication - this will be handled by the API calls"
    else
        log_info "n8n API accessible"
    fi
}

# Import a single workflow
import_workflow() {
    local workflow_file="$1"
    local workflow_name=$(basename "$workflow_file" .json)
    
    log_info "Importing workflow: $workflow_name"
    
    # Check if workflow file exists and is readable
    if [ ! -f "$workflow_file" ]; then
        log_error "Workflow file not found: $workflow_file"
        return 1
    fi
    
    if [ ! -r "$workflow_file" ]; then
        log_error "Cannot read workflow file: $workflow_file"
        return 1
    fi
    
    # Validate JSON format
    if ! jq empty "$workflow_file" 2>/dev/null; then
        log_error "Invalid JSON in workflow file: $workflow_file"
        return 1
    fi
    
    # Import workflow via n8n API
    local response
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d @"$workflow_file" \
        "${N8N_URL}/rest/workflows/import" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Check if response contains an error
        if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
            local error_message=$(echo "$response" | jq -r '.error.message // .error')
            log_error "Failed to import $workflow_name: $error_message"
            return 1
        else
            log_success "Successfully imported: $workflow_name"
            return 0
        fi
    else
        log_error "Failed to import $workflow_name: API request failed"
        return 1
    fi
}

# Main import function
import_all_workflows() {
    log_info "Starting workflow import process..."
    
    # Check if workflows directory exists
    if [ ! -d "$WORKFLOWS_DIR" ]; then
        log_error "Workflows directory not found: $WORKFLOWS_DIR"
        return 1
    fi
    
    # Count workflow files
    local workflow_files=($(find "$WORKFLOWS_DIR" -name "*.json" -type f))
    local total_workflows=${#workflow_files[@]}
    
    if [ $total_workflows -eq 0 ]; then
        log_warning "No workflow files found in $WORKFLOWS_DIR"
        return 0
    fi
    
    log_info "Found $total_workflows workflow files to import"
    
    # Import each workflow
    local success_count=0
    local failed_count=0
    
    for workflow_file in "${workflow_files[@]}"; do
        if import_workflow "$workflow_file"; then
            success_count=$((success_count + 1))
        else
            failed_count=$((failed_count + 1))
        fi
    done
    
    # Summary
    echo ""
    log_info "Import Summary:"
    log_success "Successfully imported: $success_count workflows"
    
    if [ $failed_count -gt 0 ]; then
        log_error "Failed to import: $failed_count workflows"
        return 1
    else
        log_success "All workflows imported successfully!"
        return 0
    fi
}

# Print usage information
print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Import n8n workflows from the workflows/ directory"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Enable verbose output"
    echo ""
    echo "Environment Variables:"
    echo "  N8N_HOST       n8n host (default: localhost)"
    echo "  N8N_PORT       n8n port (default: 5678)"
    echo "  N8N_PROTOCOL   n8n protocol (default: http)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Import all workflows"
    echo "  N8N_HOST=myhost $0    # Import with custom host"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            print_usage
            exit 0
            ;;
        -v|--verbose)
            set -x  # Enable verbose mode
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    log_info "Multi-Platform Auto Response System - Workflow Import"
    log_info "Target n8n instance: ${N8N_URL}"
    
    # Check dependencies
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        exit 1
    fi
    
    # Check n8n health
    if ! check_n8n_health; then
        exit 1
    fi
    
    # Get authentication
    get_auth_cookie
    
    # Import workflows
    if import_all_workflows; then
        log_success "Workflow import completed successfully!"
        echo ""
        log_info "Next steps:"
        log_info "1. Run 'make activate' to activate all workflows"
        log_info "2. Configure webhook URLs in your platform settings"
        log_info "3. Access n8n UI at ${N8N_URL} to monitor executions"
        exit 0
    else
        log_error "Workflow import failed!"
        exit 1
    fi
}

# Run main function
main "$@"