# OCR pentru listele art. 33 scanate (PDF fără text), cu ce are deja Windows 10/11:
# Windows.Data.Pdf randează pagina, Windows.Media.Ocr citește cuvintele cu pozițiile lor.
# Nimic de instalat. Ieșirea: JSON cu cuvintele pe pagini, pe care citeste.mjs îl transformă
# în rânduri, la fel ca textul unui PDF (randuriOcr).
#
#   powershell -ExecutionPolicy Bypass -File scripts/colectare/art33/ocr.ps1 -Pdf <fisier.pdf> -Out <fisier.ocr.json>
param([Parameter(Mandatory = $true)][string]$Pdf, [Parameter(Mandatory = $true)][string]$Out, [int]$Latime = 3400)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]

$metodaGenerica = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
$metodaActiune = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' })[0]
function Asteapta($op, [Type]$tip) { $t = $metodaGenerica.MakeGenericMethod($tip).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; $t.Result }
function AsteaptaActiune($op) { $t = $metodaActiune.Invoke($null, @($op)); $t.Wait(-1) | Out-Null }

$cale = (Resolve-Path $Pdf).Path
$fisier = Asteapta ([Windows.Storage.StorageFile]::GetFileFromPathAsync($cale)) ([Windows.Storage.StorageFile])
$doc = Asteapta ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($fisier)) ([Windows.Data.Pdf.PdfDocument])
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]
$motor = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new('en-US'))
if ($null -eq $motor) { $motor = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages() }
$maxim = [Windows.Media.Ocr.OcrEngine]::MaxImageDimension

$pagini = @()
for ($i = 0; $i -lt $doc.PageCount; $i++) {
  $pagina = $doc.GetPage($i)
  $flux = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
  $opt = New-Object Windows.Data.Pdf.PdfPageRenderOptions
  $w = [Math]::Min($Latime, $maxim)
  $h = [Math]::Round($pagina.Size.Height * $w / $pagina.Size.Width)
  if ($h -gt $maxim) { $w = [Math]::Floor($w * $maxim / $h); $h = $maxim }
  $opt.DestinationWidth = [uint32]$w
  $opt.DestinationHeight = [uint32]$h
  AsteaptaActiune ($pagina.RenderToStreamAsync($flux, $opt))
  $dec = Asteapta ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($flux)) ([Windows.Graphics.Imaging.BitmapDecoder])
  # Multe liste sunt scanate culcate (landscape pe pagină portret). Se încearcă 0°, 90° și 270°
  # și se păstrează orientarea cu cele mai multe cuvinte și sume citibile.
  $rez = $null; $scor = -1; $wFinal = $w; $hFinal = $h
  foreach ($rot in @('None', 'Clockwise90Degrees', 'Clockwise270Degrees')) {
    $tr = New-Object Windows.Graphics.Imaging.BitmapTransform
    $tr.Rotation = [Windows.Graphics.Imaging.BitmapRotation]::$rot
    $bmp = Asteapta ($dec.GetSoftwareBitmapAsync([Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8, [Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied, $tr, [Windows.Graphics.Imaging.ExifOrientationMode]::IgnoreExifOrientation, [Windows.Graphics.Imaging.ColorManagementMode]::DoNotColorManage)) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $r0 = Asteapta ($motor.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
    $s = 0
    foreach ($l in $r0.Lines) { foreach ($c in $l.Words) { if ($c.Text -match '^[A-Za-z]{3,}$' -or $c.Text -match '^\d{1,3}([.,]\d{3})+$') { $s++ } } }
    if ($s -gt $scor) { $scor = $s; $rez = $r0; $wFinal = $bmp.PixelWidth; $hFinal = $bmp.PixelHeight }
    if ($rot -eq 'None' -and $s -gt 150) { break }
  }
  $w = $wFinal; $h = $hFinal
  $cuvinte = @()
  foreach ($linie in $rez.Lines) {
    foreach ($c in $linie.Words) {
      $r = $c.BoundingRect
      $cuvinte += [pscustomobject]@{ t = $c.Text; x = [Math]::Round($r.X, 1); y = [Math]::Round($r.Y, 1); w = [Math]::Round($r.Width, 1); h = [Math]::Round($r.Height, 1) }
    }
  }
  $pagini += [pscustomobject]@{ pagina = $i + 1; latime = $w; inaltime = $h; unghi = $rez.TextAngle; cuvinte = $cuvinte }
  $pagina.Dispose()
}
$json = [pscustomobject]@{ sursa = $cale; pagini = $pagini } | ConvertTo-Json -Depth 6 -Compress
[System.IO.File]::WriteAllText($Out, $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Output "OCR: $($doc.PageCount) pagini -> $Out"
