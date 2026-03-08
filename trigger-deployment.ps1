# Script to trigger deployment by creating a dummy commit
Write-Host "Triggering deployment via GitHub Actions..." -ForegroundColor Green

# Create a dummy file to trigger the workflow
"Deployment triggered at $(Get-Date)" > deployment-trigger.txt

# Add, commit and push to trigger the workflow
git add deployment-trigger.txt
git commit -m "Trigger deployment"
git push origin main

Write-Host "✅ Deployment triggered! Check GitHub Actions for progress." -ForegroundColor Green
Write-Host "GitHub Actions URL: https://github.com/Alejob60/video-generator/actions" -ForegroundColor Cyan