$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache"

$items = @(
    @{ name="nsis-3.0.4.1"; url="https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z"; dest="$cacheDir\nsis" },
    @{ name="nsis-resources-3.4.1"; url="https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-resources-3.4.1/nsis-resources-3.4.1.7z"; dest="$cacheDir\nsis" }
)

$7z = "$PSScriptRoot\node_modules\7zip-bin\win\x64\7za.exe"

foreach ($item in $items) {
    $targetDir = "$($item.dest)\$($item.name)"
    if (-not (Test-Path $targetDir)) {
        Write-Host "Creating $($item.dest)"
        New-Item -ItemType Directory -Force -Path $item.dest | Out-Null
        
        $zipPath = "$($item.dest)\$($item.name).7z"
        Write-Host "Downloading $($item.name)..."
        Invoke-WebRequest -Uri $item.url -OutFile $zipPath
        
        Write-Host "Extracting..."
        & $7z x $zipPath -o"$targetDir" -bd -y
    }
}

Write-Host "Done!"
exit 0
