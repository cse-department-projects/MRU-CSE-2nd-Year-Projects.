$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $scriptDir) { $scriptDir = Get-Location }
Set-Location $scriptDir

$ProgressPreference = 'SilentlyContinue'

$libDir = Join-Path $scriptDir 'lib'
if (-not (Test-Path $libDir)) {
    New-Item -ItemType Directory -Path $libDir | Out-Null
}

$urls = @(
    'https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.12/slf4j-api-2.0.12.jar',
    'https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/2.0.12/slf4j-simple-2.0.12.jar',
    'https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.45.1.0/sqlite-jdbc-3.45.1.0.jar',
    'https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.2/postgresql-42.7.2.jar',
    'https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.17.0/jackson-databind-2.17.0.jar',
    'https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.17.0/jackson-core-2.17.0.jar',
    'https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.17.0/jackson-annotations-2.17.0.jar',
    'https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.3.0/mysql-connector-j-8.3.0.jar',
    'https://repo1.maven.org/maven2/org/openjfx/javafx-controls/21.0.1/javafx-controls-21.0.1-win.jar',
    'https://repo1.maven.org/maven2/org/openjfx/javafx-graphics/21.0.1/javafx-graphics-21.0.1-win.jar',
    'https://repo1.maven.org/maven2/org/openjfx/javafx-base/21.0.1/javafx-base-21.0.1-win.jar',
    'https://repo1.maven.org/maven2/org/openjfx/javafx-fxml/21.0.1/javafx-fxml-21.0.1-win.jar'
)

foreach ($url in $urls) {
    $fileName = Split-Path $url -Leaf
    $dest = Join-Path $libDir $fileName
    if (-not (Test-Path $dest)) {
        Write-Host "Downloading $fileName ..."
        Invoke-WebRequest -Uri $url -OutFile $dest
    } else {
        Write-Host "Found $fileName"
    }
}
