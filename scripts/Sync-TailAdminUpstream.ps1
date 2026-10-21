[CmdletBinding(SupportsShouldProcess=$true)]
param([switch]$Execute)
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
function Invoke-RepoGit {
  param([Parameter(Mandatory=$true)][string[]]$Arguments)
  $out=& git -C $repo @Arguments
  if($LASTEXITCODE -ne 0){throw ("git " + ($Arguments -join ' ') + " failed")}
  return $out
}
$branch=((Invoke-RepoGit -Arguments @('branch','--show-current')) -join '').Trim()
if($branch -ne 's2-admin'){throw "Checkout the s2-admin branch first; currently: $branch"}
$status=@(Invoke-RepoGit -Arguments @('status','--porcelain'))
if($status.Count -gt 0){throw 'Working tree is not clean. Commit or preserve changes first; no automatic stash/reset.'}
$origin=((Invoke-RepoGit -Arguments @('remote','get-url','origin')) -join '').Trim()
$vendor=((Invoke-RepoGit -Arguments @('remote','get-url','upstream')) -join '').Trim()
if($origin -ne 'https://github.com/fschrooge-netizen/tailadmin-free-tailwind-dashboard-template.git'){throw "Unexpected fork URL: $origin"}
if($vendor -ne 'https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template.git'){throw "Unexpected vendor URL: $vendor"}
if(-not $Execute){
  $remote=@(Invoke-RepoGit -Arguments @('ls-remote','--heads','upstream','main'))
  Write-Output ('DRY RUN: local HEAD '+((Invoke-RepoGit -Arguments @('rev-parse','HEAD')) -join '').Trim())
  Write-Output ('DRY RUN: latest remote '+($remote -join ' '))
  Write-Output 'DRY RUN: -Execute fetches upstream, creates a local backup if an update exists, then merges upstream/main without pushing.'
  return
}
if(-not $PSCmdlet.ShouldProcess($repo,'Fetch and merge original TailAdmin main into S2 customization branch with backup')){return}
Invoke-RepoGit -Arguments @('fetch','upstream','main') | Out-Null
$upstream=((Invoke-RepoGit -Arguments @('rev-parse','upstream/main')) -join '').Trim()
$head=((Invoke-RepoGit -Arguments @('rev-parse','HEAD')) -join '').Trim()
& git -C $repo merge-base --is-ancestor $upstream HEAD
if($LASTEXITCODE -eq 0){
  Write-Output ('UP_TO_DATE: s2-admin contains upstream main at '+$upstream)
  return
}
$backup='backup/s2-admin-'+(Get-Date).ToString('yyyyMMdd-HHmmss')
Invoke-RepoGit -Arguments @('branch',$backup,$head) | Out-Null
Write-Output ('BACKUP_BRANCH='+$backup)
Write-Output ('UPSTREAM='+$upstream)
& git -C $repo merge --no-edit upstream/main
if($LASTEXITCODE -ne 0){
  Write-Output 'MERGE_CONFLICT: review git status and resolve manually; local backup retained. No reset/force push.'
  exit 1
}
Write-Output ('MERGED: '+((Invoke-RepoGit -Arguments @('rev-parse','HEAD')) -join '').Trim())
Write-Output 'Local merge only. Run build/tests and approve any later push or production deployment.'
