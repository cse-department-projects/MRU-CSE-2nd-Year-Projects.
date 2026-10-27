$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $scriptDir) { $scriptDir = Get-Location }
Set-Location $scriptDir

$binDir = Join-Path $scriptDir 'bin'
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir | Out-Null
}

$srcDir = Join-Path $scriptDir 'src/main/java'
$javaFiles = Get-ChildItem -Path $srcDir -Filter '*.java' -Recurse | Select-Object -ExpandProperty FullName

$javac = 'javac'
if (-not (Get-Command 'javac' -ErrorAction SilentlyContinue)) {
    if (Test-Path 'C:\Program Files\Java\jdk-26.0.1\bin\javac.exe') {
        $javac = 'C:\Program Files\Java\jdk-26.0.1\bin\javac.exe'
    }
}

Write-Host "Compiling $($javaFiles.Count) Java source files..."

$libDir = Join-Path $scriptDir 'lib/*'
$resDir = Join-Path $scriptDir 'src/main/resources'
$cp = "$libDir;$resDir"

$args = @('-d', $binDir, '-cp', $cp) + $javaFiles

& $javac @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Compilation completed with 0 errors!" -ForegroundColor Green
    Copy-Item -Path "$resDir/*" -Destination $binDir -Recurse -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "[ERROR] Compilation failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
