#!/bin/bash

# Multi-Platform Auto Response System - Workflow Activation Script
# This script activates all imported n8n workflows

set -e  # Exit on any error

# Configuration
N8N_HOST="${N8N_HOST:-localhost}"
N8N_PORT="${N8N_PORT:-5678}"
N8N_PROTOCOL="${N8N_PROTOCOL:-http}"
N8N_URL="${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
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

# Get list of all workflows
get_workflows() {
    log_info "Fetching workflow list from n8n..."
    
    local response
    response=$(curl -s -X GET "${N8N_URL}/rest/workflows" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "$response"
        return 0
    else
        log_error "Failed to fetch workflows from n8n API"
        return 1
    fi
}

# Activate a single workflow
activate_workflow() {
    local workflow_id="$1"
    local workflow_name="$2"
    
    log_info "Activating workflow: $workflow_name (ID: $workflow_id)"
    
    # Activate workflow via n8n API
    local response
    response=$(curl -s -X PATCH \
        -H "Content-Type: application/json" \
        -d '{"active": true}' \
        "${N8N_URL}/rest/workflows/${workflow_id}/activate" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Check if response contains an error
        if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
            local error_message=$(echo "$response" | jq -r '.error.message // .error')
            log_error "Failed to activate $workflow_name: $error_message"
            return 1
        else
            log_success "Successfully activated: $workflow_name"
            return 0
        fi
    else
        log_error "Failed to activate $workflow_name: API request failed"
        return 1
    fi
}

# Get webhook URLs for activated workflows
get_webhook_urls() {
    log_info "Retrieving webhook URLs..."
    
    local workflows_response
    workflows_response=$(get_workflows)
    
    if [ $? -ne 0 ]; then
        log_error "Cannot retrieve webhook URLs - failed to get workflows"
        return 1
    fi
    
    echo ""
    log_info "Available Webhook URLs:"
    echo "========================================"
    
    # Expected webhook paths based on our workflow design
    local webhook_paths=(
        "instagram-intake"
        "whatsapp-intake" 
        "google-reviews-intake"
        "processor"
        "sender-instagram"
        "sender-whatsapp"
        "sender-gbp"
    )
    
    for path in "${webhook_paths[@]}"; do
        echo "  ${N8N_URL}/webhook/${path}"
    done
    
    echo ""
    log_info "Platform Configuration:"
    echo "========================================"
    echo "Instagram Webhooks:"
    echo "  URL: ${N8N_URL}/webhook/instagram-intake"
    echo "  Verify Token: \$META_VERIFY_TOKEN (from your .env file)"
    echo ""
    echo "WhatsApp Webhooks:"
    echo "  URL: ${N8N_URL}/webhook/whatsapp-intake"
    echo "  Verify Token: \$META_VERIFY_TOKEN (from your .env file)"
    echo ""
    echo "Google Reviews:"
    echo "  URL: ${N8N_URL}/webhook/google-reviews-intake"
    echo "  (Or configure Google Business Profile trigger in n8n)"
    echo ""
}

# Main activation function
activate_all_workflows() {
    log_info "Starting workflow activation process..."
    
    # Get workflows from n8n
    local workflows_response
    workflows_response=$(get_workflows)
    
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    # Parse workflows and count them
    local workflow_count
    workflow_count=$(echo "$workflows_response" | jq '. | length' 2>/dev/null)
    
    if [ -z "$workflow_count" ] || [ "$workflow_count" = "null" ]; then
        log_warning "No workflows found in n8n"
        log_info "Please run 'make import' first to import workflows"
        return 0
    fi
    
    log_info "Found $workflow_count workflows to activate"
    
    # Activate each workflow
    local success_count=0
    local failed_count=0
    local already_active_count=0
    
    for i in $(seq 0 $((workflow_count - 1))); do
        local workflow=$(echo "$workflows_response" | jq -r ".[$i]")
        local workflow_id=$(echo "$workflow" | jq -r '.id')
        local workflow_name=$(echo "$workflow" | jq -r '.name')
        local is_active=$(echo "$workflow" | jq -r '.active')
        
        if [ "$is_active" = "true" ]; then
            log_info "Workflow already active: $workflow_name"
            already_active_count=$((already_active_count + 1))
        else
            if activate_workflow "$workflow_id" "$workflow_name"; then
                success_count=$((success_count + 1))
            else
                failed_count=$((failed_count + 1))
            fi
        fi
    done
    
    # Summary
    echo ""
    log_info "Activation Summary:"
    log_success "Successfully activated: $success_count workflows"
    log_info "Already active: $already_active_count workflows"
    
    if [ $failed_count -gt 0 ]; then
        log_error "Failed to activate: $failed_count workflows"
        return 1
    else
        log_success "All workflows are now active!"
        return 0
    fi
}

# Print usage information
print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Activate all imported n8n workflows"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Enable verbose output"
    echo "  -u, --urls     Show webhook URLs only"
    echo ""
    echo "Environment Variables:"
    echo "  N8N_HOST       n8n host (default: localhost)"
    echo "  N8N_PORT       n8n port (default: 5678)"
    echo "  N8N_PROTOCOL   n8n protocol (default: http)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Activate all workflows"
    echo "  $0 --urls            # Show webhook URLs only"
    echo "  N8N_HOST=myhost $0    # Activate with custom host"
}

# Parse command line arguments
SHOW_URLS_ONLY=false

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
        -u|--urls)
            SHOW_URLS_ONLY=true
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
    log_info "Multi-Platform Auto Response System - Workflow Activation"
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
    
    # If only URLs requested, show them and exit
    if [ "$SHOW_URLS_ONLY" = true ]; then
        get_webhook_urls
        exit 0
    fi
    
    # Activate workflows
    if activate_all_workflows; then
        log_success "Workflow activation completed successfully!"
        
        # Show webhook URLs
        get_webhook_urls
        
        echo ""
        log_info "System is ready!"
        log_info "Access n8n UI at ${N8N_URL} to monitor workflow executions"
        exit 0
    else
        log_error "Workflow activation failed!"
        exit 1
    fi
}

# Run main function
main "$@"