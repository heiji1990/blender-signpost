# Blenderの道しるべ - 週次リンクチェックスクリプト
# 使い方: powershell -ExecutionPolicy Bypass -File scripts/check-links.ps1

$contentDir = Join-Path $PSScriptRoot "..\src\content"
$reportFile = Join-Path $PSScriptRoot "link-check-report.md"
$enc = New-Object System.Text.UTF8Encoding($false)

$results = @()
$broken = @()
$ok = 0
$skip = 0

# Cloudflare/bot保護で自動チェック不可のドメイン（手動確認が必要）
$botProtectedDomains = @("udemy.com", "superhivemarket.com", "blendermarket.com", "coloso.jp")

function Check-Url {
    param([string]$url)
    if ($url -match "^https?://") {
        # bot保護ドメインは自動チェックをスキップ
        if ($url -like "*udemy.com*" -or $url -like "*superhivemarket.com*" -or $url -like "*blendermarket.com*" -or $url -like "*coloso.jp*") {
            return "MANUAL_CHECK"
        }
        try {
            $resp = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            return [int]$resp.StatusCode
        } catch {
            try {
                $resp = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing -MaximumRedirection 5 -ErrorAction Stop
                return [int]$resp.StatusCode
            } catch {
                return "ERROR"
            }
        }
    }
    return "SKIP"
}

$jsonFiles = Get-ChildItem -Path $contentDir -Filter "*.json" -Recurse

foreach ($file in $jsonFiles) {
    # BOM対応のため ReadAllText を使用
    $rawJson = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8).TrimStart([char]0xFEFF)

    try {
        $data = $rawJson | ConvertFrom-Json
    } catch {
        Write-Host "SKIP (parse error): $($file.Name)"
        continue
    }

    $url = $data.url
    $id = if ($data.id) { $data.id } elseif ($data.name) { $data.name } else { $file.BaseName }
    $title = if ($data.title) { $data.title } elseif ($data.name) { $data.name } else { $file.BaseName }
    $type = $data.type

    if (-not $url) {
        continue
    }

    if ($url -match "example") {
        $results += [PSCustomObject]@{ id=$id; title=$title; url=$url; status="PLACEHOLDER"; type=$type }
        $skip++
        continue
    }

    Write-Host "Checking [$id] $url ..." -NoNewline
    $status = Check-Url $url
    Write-Host " $status"

    $entry = [PSCustomObject]@{ id=$id; title=$title; url=$url; status=$status; type=$type }
    $results += $entry

    if ($status -match "^(4[0-9]{2}|5[0-9]{2}|ERROR)") {
        $broken += $entry
    } elseif ($status -eq "MANUAL_CHECK") {
        # bot保護サイトはカウントしない（手動確認リストに別途表示）
    } else {
        $ok++
    }
}

# レポート生成
$date = Get-Date -Format "yyyy-MM-dd HH:mm"
$report = @"
# リンクチェックレポート
生成日時: $date

## サマリー
- OK: $ok 件
- 異常: $($broken.Count) 件
- プレースホルダー: $skip 件
- 合計: $($results.Count) 件

"@

$manualCheck = $results | Where-Object { $_.status -eq "MANUAL_CHECK" }

if ($broken.Count -gt 0) {
    $report += "## 要確認リンク（自動チェック失敗）`n`n"
    foreach ($b in $broken) {
        $report += "- [$($b.id)] $($b.title)`n  URL: $($b.url)`n  Status: $($b.status)`n`n"
    }
}

if ($manualCheck.Count -gt 0) {
    $report += "## 手動確認が必要なリンク（bot保護サイト）`n`n"
    $report += "以下のサイトはCloudflare等のbot対策のため自動チェック不可。月1回ブラウザで確認してください。`n`n"
    foreach ($m in $manualCheck) {
        $report += "- [$($m.id)] $($m.title)`n  URL: $($m.url)`n`n"
    }
}

if ($skip -gt 0) {
    $report += "## プレースホルダーURL（要更新）`n`n"
    foreach ($r in $results | Where-Object { $_.status -eq "PLACEHOLDER" }) {
        $report += "- [$($r.id)] $($r.title)`n  URL: $($r.url)`n`n"
    }
}

$report += "## 正常リンク一覧`n`n"
foreach ($r in $results | Where-Object { $_.status -notmatch "^(4[0-9]{2}|5[0-9]{2}|ERROR|PLACEHOLDER)" }) {
    $report += "- [$($r.id)] $($r.title) $($r.status)`n"
}

[System.IO.File]::WriteAllText($reportFile, $report, $enc)

Write-Host ""
Write-Host "=== チェック完了 ==="
Write-Host "OK: $ok件 / 異常: $($broken.Count)件 / プレースホルダー: $skip件"
Write-Host "レポート: $reportFile"
