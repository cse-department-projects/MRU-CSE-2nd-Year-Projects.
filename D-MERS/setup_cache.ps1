$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
$targetDir = "$cacheDir\winCodeSign-2.6.0"

if (-not (Test-Path $targetDir)) {
    Write-Host "Creating $targetDir"
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

$zipPath = "$cacheDir\winCodeSign.7z"
if (-not (Test-Path $zipPath)) {
    Write-Host "Downloading winCodeSign..."
    Invoke-WebRequest -Uri "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z" -OutFile $zipPath
}

Write-Host "Extracting..."
$7z = "$PSScriptRoot\node_modules\7zip-bin\win\x64\7za.exe"
# Extract and ignore errors (like symlink failures)
& $7z x $zipPath -o"$targetDir" -bd -y

Write-Host "Done!"
exit 0
