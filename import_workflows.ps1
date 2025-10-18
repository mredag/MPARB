# Import n8n workflows
$n8nUrl = "http://localhost:5678"
$workflowsDir = "workflows"

Write-Host "Importing n8n workflows..." -ForegroundColor Blue

# Get all workflow JSON files
$workflowFiles = Get-ChildItem -Path $workflowsDir -Filter "*.json" | Where-Object { $_.Name -ne ".gitkeep" }

foreach ($file in $workflowFiles) {
    Write-Host "Importing: $($file.Name)" -ForegroundColor Yellow
    
    try {
        $content = Get-Content -Path $file.FullName -Raw
        $response = Invoke-RestMethod -Uri "$n8nUrl/rest/workflows/import" -Method POST -Body $content -ContentType "application/json"
        Write-Host "Successfully imported: $($file.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to import $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Workflow import completed!" -ForegroundColor Green