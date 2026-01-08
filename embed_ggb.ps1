$files = Get-ChildItem "defi*.html"
foreach ($file in $files) {
    Write-Host "Checking $($file.Name)..."
    $path = $file.FullName
    $content = [System.IO.File]::ReadAllText($path)
    
    # Regex find: "filename": "something.ggb"
    if ($content -match '"filename":\s*"([^"]+\.ggb)"') {
        $fullMatch = $matches[0]
        $ggbFilename = $matches[1]
        
        if (Test-Path $ggbFilename) {
            Write-Host "  Found reference to $ggbFilename. Embedding..."
            
            # Read bytes and convert to Base64
            $ggbPath = Join-Path $PWD $ggbFilename
            $bytes = [System.IO.File]::ReadAllBytes($ggbPath)
            $base64 = [Convert]::ToBase64String($bytes)
            
            # Create new param string
            $newParam = '"ggbBase64": "' + $base64 + '"'
            
            # Replace
            $newContent = $content.Replace($fullMatch, $newParam)
            
            [System.IO.File]::WriteAllText($path, $newContent)
            Write-Host "  Successfully updated $($file.Name)"
        } else {
            Write-Host "  Warning: Referenced file $ggbFilename not found!"
        }
    } else {
        Write-Host "  No .ggb filename reference found."
    }
}
