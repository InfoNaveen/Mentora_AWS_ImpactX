@echo off
echo Starting Mentora Frontend...
cd frontend
if not exist node_modules (
    npm install
)
npm run dev

