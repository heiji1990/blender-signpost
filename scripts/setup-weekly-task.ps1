# Blender道しるべ - Windowsタスクスケジューラへの週次チェック登録スクリプト
# 管理者権限で実行: powershell -ExecutionPolicy Bypass -File scripts/setup-weekly-task.ps1

$taskName = "BlenderSignpost_WeeklyLinkCheck"
$scriptPath = Join-Path $PSScriptRoot "check-links.ps1"
$projectRoot = Split-Path $PSScriptRoot -Parent

# 既存タスクを削除
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# 毎週月曜日 9:00 に実行
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "09:00"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`"" -WorkingDirectory $projectRoot
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Settings $settings -Description "Blender道しるべ 週次リンクチェック" -RunLevel Highest

Write-Host "タスク登録完了: $taskName"
Write-Host "毎週月曜9:00にリンクチェックが実行されます"
Write-Host "レポート: $projectRoot\scripts\link-check-report.md"
