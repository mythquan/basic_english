# Basic English Site — Local HTTP Server
# Open http://localhost:8080 in your browser

$port = 8080
$root = Join-Path $PSScriptRoot "."  # site directory

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "  Basic English Site" -ForegroundColor Cyan
Write-Host "  Server: http://localhost:$port/" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response

        $path = $req.Url.AbsolutePath.TrimStart('/')
        if ($path -eq '') { $path = 'index.html' }

        $fullPath = Join-Path $root $path
        $ext = [IO.Path]::GetExtension($fullPath)

        $mime = @{
            '.html' = 'text/html'
            '.css'  = 'text/css'
            '.js'   = 'application/javascript'
            '.png'  = 'image/png'
            '.jpg'  = 'image/jpeg'
            '.svg'  = 'image/svg+xml'
            '.ico'  = 'image/x-icon'
        }

        if (Test-Path $fullPath) {
            $data = [IO.File]::ReadAllBytes($fullPath)
            $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'text/plain' }
            $res.ContentLength64 = $data.Length
            $res.OutputStream.Write($data, 0, $data.Length)
        } else {
            $res.StatusCode = 404
            $err = [Text.Encoding]::UTF8.GetBytes("404 - $path not found")
            $res.OutputStream.Write($err, 0, $err.Length)
        }
        $res.OutputStream.Close()
    }
} finally {
    if ($listener.IsListening) { $listener.Stop() }
}
