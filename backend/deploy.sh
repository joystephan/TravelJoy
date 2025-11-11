#!/bin/bash

# TravelJoy Backend Deployment Script
# This script helps deploy the backend to various platforms

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if .env.production exists
check_env_file() {
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found"
        print_info "Copy .env.production.example to .env.production and configure it"
        exit 1
    fi
    print_success ".env.production file found"
}

# Check if required environment variables are set
check_env_vars() {
    print_info "Checking required environment variables..."
    
    source .env.production
    
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "REDIS_HOST"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Build the application
build_app() {
    print_info "Building application..."
    
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."
    
    npm run prisma:migrate:prod
    
    if [ $? -eq 0 ]; then
        print_success "Migrations completed successfully"
    else
        print_error "Migrations failed"
        exit 1
    fi
}

# Test database connection
test_db_connection() {
    print_info "Testing database connection..."
    
    npx prisma db pull --force
    
    if [ $? -eq 0 ]; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        exit 1
    fi
}

# Deploy to Render
deploy_render() {
    print_header "Deploying to Render"
    
    print_info "Pushing to GitHub..."
    git push origin main
    
    print_success "Code pushed to GitHub"
    print_info "Render will automatically deploy from GitHub"
    print_info "Monitor deployment at: https://dashboard.render.com"
}

# Deploy to Fly.io
deploy_fly() {
    print_header "Deploying to Fly.io"
    
    # Check if fly CLI is installed
    if ! command -v fly &> /dev/null; then
        print_error "Fly CLI not found"
        print_info "Install it: curl -L https://fly.io/install.sh | sh"
        exit 1
    fi
    
    print_info "Deploying to Fly.io..."
    fly deploy
    
    if [ $? -eq 0 ]; then
        print_success "Deployment to Fly.io successful"
        print_info "Run migrations: fly ssh console -C 'npm run prisma:migrate:prod'"
    else
        print_error "Deployment to Fly.io failed"
        exit 1
    fi
}

# Deploy to Railway
deploy_railway() {
    print_header "Deploying to Railway"
    
    # Check if railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found"
        print_info "Install it: npm i -g @railway/cli"
        exit 1
    fi
    
    print_info "Deploying to Railway..."
    railway up
    
    if [ $? -eq 0 ]; then
        print_success "Deployment to Railway successful"
    else
        print_error "Deployment to Railway failed"
        exit 1
    fi
}

# Build Docker image
build_docker() {
    print_header "Building Docker Image"
    
    print_info "Building Docker image..."
    docker build -t traveljoy-backend:latest .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Docker build failed"
        exit 1
    fi
}

# Test Docker image locally
test_docker() {
    print_header "Testing Docker Image"
    
    print_info "Starting Docker container..."
    docker-compose -f ../docker-compose.prod.yml up -d
    
    sleep 5
    
    print_info "Testing health endpoint..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
    
    if [ "$response" = "200" ]; then
        print_success "Health check passed"
    else
        print_error "Health check failed (HTTP $response)"
        docker-compose -f ../docker-compose.prod.yml logs backend
        exit 1
    fi
    
    print_info "Stopping Docker container..."
    docker-compose -f ../docker-compose.prod.yml down
}

# Deploy to AWS Elastic Beanstalk
deploy_aws() {
    print_header "Deploying to AWS Elastic Beanstalk"
    
    # Check if eb CLI is installed
    if ! command -v eb &> /dev/null; then
        print_error "EB CLI not found"
        print_info "Install it: pip install awsebcli"
        exit 1
    fi
    
    print_info "Deploying to AWS..."
    eb deploy
    
    if [ $? -eq 0 ]; then
        print_success "Deployment to AWS successful"
    else
        print_error "Deployment to AWS failed"
        exit 1
    fi
}

# Main menu
show_menu() {
    print_header "TravelJoy Backend Deployment"
    
    echo "Select deployment target:"
    echo "1) Render"
    echo "2) Fly.io"
    echo "3) Railway"
    echo "4) AWS Elastic Beanstalk"
    echo "5) Build Docker image"
    echo "6) Test Docker image locally"
    echo "7) Pre-deployment checks only"
    echo "8) Exit"
    echo ""
    read -p "Enter choice [1-8]: " choice
    
    case $choice in
        1)
            check_env_file
            check_env_vars
            build_app
            deploy_render
            ;;
        2)
            check_env_file
            check_env_vars
            build_app
            deploy_fly
            ;;
        3)
            check_env_file
            check_env_vars
            build_app
            deploy_railway
            ;;
        4)
            check_env_file
            check_env_vars
            build_app
            deploy_aws
            ;;
        5)
            build_docker
            ;;
        6)
            build_docker
            test_docker
            ;;
        7)
            check_env_file
            check_env_vars
            test_db_connection
            build_app
            print_success "All pre-deployment checks passed!"
            ;;
        8)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Run main menu
show_menu

print_header "Deployment Complete!"
print_info "Next steps:"
echo "1. Verify deployment at your production URL"
echo "2. Test API endpoints"
echo "3. Configure Stripe webhooks"
echo "4. Set up monitoring and alerts"
echo "5. Update mobile app with production API URL"
