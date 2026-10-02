#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== Building React Frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Building Django Backend ==="
cd backend
pip install -r requirements.txt
python manage.py migrate
