# TailAdmin upstream updates for S2 Admin

## Repository layout

- Local folder: `D:\dev\s2-admin` on S2TECH1.
- `origin`: `https://github.com/fschrooge-netizen/tailadmin-free-tailwind-dashboard-template.git` (your fork; do not force-push).
- `upstream`: `https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template.git` (original vendor, fetch only).
- `main`: clean tracking branch for **your fork**. Avoid project-specific edits here.
- `s2-admin`: local customization branch; keep all S2 Admin changes here. Do not push this branch to `origin/main`.

As verified on 2026-10-21, `origin/main` and `upstream/main` were identical at `1bd2dc42a8467ae0281cf00bd0050da4c9c4be07`. This changes over time.

## When TailAdmin releases an update

Run the supplied script from a **clean** `s2-admin` checkout:

```powershell
& 'D:\dev\s2-admin\scripts\Sync-TailAdminUpstream.ps1'
# Preview only. Shows the current remote main commit without merging.
& 'D:\dev\s2-admin\scripts\Sync-TailAdminUpstream.ps1' -Execute
```

`-Execute` fetches `upstream/main`, makes an automatically named *local backup branch* if updates exist, and merges upstream into `s2-admin` (never resets or force-pushes). If conflicts occur it stops; review conflicts in `git status` and source diffs rather than accepting either side blindly. Resolve conflicts and complete the merge only after confirming functionality. Use the backup branch for recovery; do not delete user changes.

After integration: `npm ci --ignore-scripts --no-audit --no-fund`, then `npm run build`, inspect the browser experience, update `CHANGELOG.md` for any user-visible alterations, and separately approve a push or deployment.

## Syncing your fork's main (optional, distinct operation)

Your fork's GitHub `main` does not automatically advance when upstream releases. The script above **does not** update GitHub. If you want to update the fork's main, use GitHub's **Sync fork** action or a separately reviewed fast-forward/PR. Keep `main` clean and never push `s2-admin` changes into it.

## Publishing customizations

Only after explicitly choosing to publish the customized branch:

```powershell
git -C 'D:\dev\s2-admin' push --set-upstream origin s2-admin
```

This sends only the `s2-admin` branch to your existing fork, not `main`. No push is done by setup or the sync script.

## Conflicts and update policy

Never overwrite `src` wholesale, delete customizations, assume releases are backwards compatible, or auto-merge into production. Prefer project-specific design tokens, wrappers, overrides and additional partials over direct edits in frequently changed vendor modules. Track license attributions; TailAdmin template is MIT. Always verify current vendor licence before reuse in a different project.
