#!/usr/bin/env powershell
# PostgreSQL Installation Script for Windows
# This script installs PostgreSQL using Chocolatey or direct download

param(
    [string]$DbPassword = "postgres",
    [int]$DbPort = 5432
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Installation Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell"
    Write-Host "2. Select 'Run as Administrator'"
    Write-Host "3. Run: Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process"
    Write-Host "4. Run: .\\install_postgresql.ps1"
    exit 1
}

# Check if PostgreSQL is already installed
Write-Host "Checking if PostgreSQL is already installed..."
$pgPath = Get-Command psql -ErrorAction SilentlyContinue
if ($pgPath) {
    Write-Host "PostgreSQL is already installed!" -ForegroundColor Green
    psql --version
    exit 0
}

# Try installing with Chocolatey
Write-Host ""
Write-Host "Installing PostgreSQL with Chocolatey..." -ForegroundColor Yellow
$chocoPath = Get-Command choco -ErrorAction SilentlyContinue
if ($chocoPath) {
    Write-Host "Chocolatey found. Attempting installation..."
    choco install postgresql15 -y --params '/Password:'"$DbPassword"' /Port:'"$DbPort"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Chocolatey installation failed. Please install PostgreSQL manually from:" -ForegroundColor Yellow
        Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "Chocolatey not found. Please install PostgreSQL manually from:" -ForegroundColor Yellow
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}

# Verify installation
Write-Host ""
Write-Host "Verifying PostgreSQL installation..."
psql --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL verified successfully!" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL installation verification failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
