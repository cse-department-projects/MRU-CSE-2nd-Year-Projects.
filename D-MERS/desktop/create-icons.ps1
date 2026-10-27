# D-MERS Icon Generator using Windows .NET System.Drawing
# Run: powershell -ExecutionPolicy Bypass -File desktop/create-icons.ps1

$ErrorActionPreference = "Stop"

$iconsDir = Join-Path $PSScriptRoot "icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
}

Write-Host "Generating D-MERS application icons..." -ForegroundColor Cyan

Add-Type -AssemblyName System.Drawing

function New-DmersIcon {
    param([int]$Size)
    
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Navy Blue background with rounded corners
    $navy = [System.Drawing.Color]::FromArgb(255, 30, 58, 138)
    $navyBrush = New-Object System.Drawing.SolidBrush($navy)
    $r = [int]($Size * 0.188)
    
    $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
    $gp.AddArc(0, 0, $r*2, $r*2, 180, 90)
    $gp.AddArc($Size - $r*2, 0, $r*2, $r*2, 270, 90)
    $gp.AddArc($Size - $r*2, $Size - $r*2, $r*2, $r*2, 0, 90)
    $gp.AddArc(0, $Size - $r*2, $r*2, $r*2, 90, 90)
    $gp.CloseFigure()
    $g.FillPath($navyBrush, $gp)
    
    # Shield shape
    $m = [int]($Size * 0.19)
    $sw = $Size - ($m * 2)
    $sh = [int]($sw * 1.1)
    $sx = $m
    $sy = [int]($Size * 0.10)
    $mx = $sx + $sw / 2
    
    $shield = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shield.AddLine($mx, $sy, $sx + $sw, $sy + [int]($sh * 0.27))
    $shield.AddLine($sx + $sw, $sy + [int]($sh * 0.27), $sx + $sw, $sy + [int]($sh * 0.55))
    $cpx1 = $sx + $sw
    $cpy1 = $sy + [int]($sh * 0.85)
    $shield.AddBezier($sx+$sw, $sy+[int]($sh*0.55), $cpx1, $cpy1, $mx, $sy+$sh, $mx, $sy+$sh)
    $shield.AddBezier($mx, $sy+$sh, $sx, $cpy1, $sx, $sy+[int]($sh*0.55), $sx, $sy+[int]($sh*0.55))
    $shield.AddLine($sx, $sy+[int]($sh*0.55), $sx, $sy+[int]($sh*0.27))
    $shield.CloseFigure()
    
    # Fill shield with semi-transparent red
    $shFill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 220, 38, 38))
    $g.FillPath($shFill, $shield)
    
    # White shield border
    $wp = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float]([int]($Size*0.045)))
    $wp.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawPath($wp, $shield)
    
    # White checkmark inside shield
    $cp = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float]([int]($Size*0.08)))
    $cp.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $cp.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $cp.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $cx = [float]($Size / 2)
    $cy = [float]($sy + $sh * 0.47)
    $s = [float]($Size * 0.13)
    $checkPts = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new($cx - $s, $cy),
        [System.Drawing.PointF]::new($cx - $s*0.15, $cy + $s*0.8),
        [System.Drawing.PointF]::new($cx + $s*1.05, $cy - $s*0.75)
    )
    $g.DrawLines($cp, $checkPts)
    
    # Red alert pulse dot top-right
    $ds = [int]($Size * 0.19)
    $dx = $Size - $ds - [int]($Size*0.04)
    $dy = [int]($Size*0.04)
    $rb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))
    $g.FillEllipse($rb, $dx, $dy, $ds, $ds)
    $inner = [int]($ds * 0.48)
    $off = [int](($ds - $inner)/2)
    $wb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillEllipse($wb, $dx+$off, $dy+$off, $inner, $inner)
    
    $g.Flush()
    $g.Dispose()
    return $bmp
}

$sizes = @(16, 32, 48, 64, 128, 256)
$bitmaps = @{}
foreach ($size in $sizes) {
    $bitmaps[$size] = New-DmersIcon -Size $size
    Write-Host "  Created ${size}x${size}" -ForegroundColor Green
}

# Save 256x256 PNG
$png256 = Join-Path $iconsDir "icon.png"
$bitmaps[256].Save($png256, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "[OK] Saved icon.png" -ForegroundColor Green

# Save 48x48 PNG
$png48 = Join-Path $iconsDir "icon_48.png"
$bitmaps[48].Save($png48, [System.Drawing.Imaging.ImageFormat]::Png)

# Build ICO file manually (PNG compressed, modern format)
$icoSizes = @(16, 32, 48, 256)
$imageData = @()
foreach ($sz in $icoSizes) {
    $ms = New-Object System.IO.MemoryStream
    $bitmaps[$sz].Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $imageData += ,($ms.ToArray())
    $ms.Dispose()
}

$icoPath = Join-Path $iconsDir "icon.ico"
$icoStream = [System.IO.File]::Create($icoPath)
$writer = New-Object System.IO.BinaryWriter($icoStream)

# ICO Header
$writer.Write([int16]0)
$writer.Write([int16]1)
$writer.Write([int16]$icoSizes.Count)

# First image data offset = 6 bytes header + (count * 16 bytes directory)
$offset = 6 + ($icoSizes.Count * 16)
for ($i = 0; $i -lt $icoSizes.Count; $i++) {
    $sz = $icoSizes[$i]
    $dim = if ($sz -ge 256) { 0 } else { [byte]$sz }
    $writer.Write([byte]$dim)
    $writer.Write([byte]$dim)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([int16]1)
    $writer.Write([int16]32)
    $writer.Write([int32]$imageData[$i].Length)
    $writer.Write([int32]$offset)
    $offset += $imageData[$i].Length
}

foreach ($data in $imageData) {
    $writer.Write($data)
}

$writer.Flush()
$writer.Close()
$icoStream.Dispose()

Write-Host "[OK] Saved icon.ico (multi-size: 16,32,48,256)" -ForegroundColor Green

foreach ($sz in $sizes) { $bitmaps[$sz].Dispose() }

Write-Host ""
Write-Host "[DONE] All D-MERS icons created in: $iconsDir" -ForegroundColor Cyan
Write-Host "Next: Run  npm run package:windows  to build the installer." -ForegroundColor Yellow
