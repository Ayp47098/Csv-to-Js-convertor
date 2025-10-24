#!/bin/bash

# CSV to JSON Converter API - Deployment & Verification Script
# This script helps you verify the project setup and dependencies

echo "================================"
echo "CSV to JSON Converter API Setup"
echo "================================"
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✓ Node.js found: $NODE_VERSION"
else
    echo "   ✗ Node.js not found. Please install Node.js 14+"
    exit 1
fi

# Check npm
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✓ npm found: $NPM_VERSION"
else
    echo "   ✗ npm not found"
    exit 1
fi

# Check PostgreSQL
echo "3. Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo "   ✓ PostgreSQL found: $PG_VERSION"
else
    echo "   ⚠ PostgreSQL not found in PATH"
    echo "     (Make sure PostgreSQL is installed and running)"
fi

# Check if .env exists
echo "4. Checking .env file..."
if [ -f .env ]; then
    echo "   ✓ .env file found"
else
    echo "   ⚠ .env file not found"
    echo "   Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "   ✓ .env created from .env.example"
        echo "   ⚠ Please edit .env with your database credentials"
    else
        echo "   ✗ .env.example not found"
        exit 1
    fi
fi

# Check package.json
echo "5. Checking package.json..."
if [ -f package.json ]; then
    echo "   ✓ package.json found"
else
    echo "   ✗ package.json not found"
    exit 1
fi

# Offer to install dependencies
echo ""
echo "6. Dependencies..."
if [ -d node_modules ]; then
    echo "   ✓ node_modules directory exists"
    read -p "   Reinstall dependencies? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Installing dependencies..."
        npm install
        if [ $? -eq 0 ]; then
            echo "   ✓ Dependencies installed successfully"
        else
            echo "   ✗ Failed to install dependencies"
            exit 1
        fi
    fi
else
    echo "   Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo "   ✓ Dependencies installed successfully"
    else
        echo "   ✗ Failed to install dependencies"
        exit 1
    fi
fi

# Summary
echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Edit .env if needed (database credentials)"
echo "2. Create PostgreSQL database:"
echo "   createdb csv_converter"
echo "3. Start the server:"
echo "   npm start"
echo "4. In another terminal, test with:"
echo "   curl -X POST http://localhost:3000/api/csv/upload \\"
echo "     -F \"file=@tests/sample.csv\""
echo ""
echo "For more information, see:"
echo "- README.md - Full documentation"
echo "- QUICK_START.md - Quick setup guide"
echo "- API_DOCUMENTATION.md - API reference"
echo ""
