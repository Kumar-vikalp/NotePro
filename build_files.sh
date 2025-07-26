#!/bin/bash

# Install from root-level requirements.txt
python3 -m pip install --upgrade pip setuptools wheel
python3 -m pip install -r requirements.txt

# Move to backend for Django management
cd backend || exit

python3 manage.py collectstatic --noinput

mkdir -p ../.vercel/output/static
cp -r staticfiles/* ../.vercel/output/static/

python3 manage.py makemigrations
python3 manage.py migrate
