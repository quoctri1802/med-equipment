#!/usr/bin/env bash
# Clean previous installation artifacts
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force
# Re‑install with verbose output for debugging
npm install --verbose
