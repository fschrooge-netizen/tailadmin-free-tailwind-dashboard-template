# Project agent operating instructions

This is a **project-independent** onboarding file created for `s2-admin`. Actual client requirements, security/data policies, technology choices and release approvals must be independently verified for this repo.

At the **start of any new project**, first follow the shared S2 skills `project-bootstrap/SKILL.md` (when accessible). It creates both root `CHANGELOG.md` and disabled `api-discovery/`, using the `ai-api-discovery/scripts/New-ApiDiscoveryWorkspace.ps1` script. A completed bootstrap must not be rerun over existing files. If either artifact is missing or unexpected, stop and reconcile before enabling providers or promising release readiness.

When making any user-facing, API-contract, install/upgrade or security change, read the shared `changelog-management/SKILL.md` (when accessible), update `CHANGELOG.md` in the same PR, and validate. Apply Keep a Changelog and SemVer. Internal-only work can omit an entry with a written reason. Never invent features, fixes, versions, releases or deployment outcomes.

For any API or AI provider research, read `ai-api-discovery/SKILL.md` when available, use **current official evidence**, enforce client-specific privacy/security approvals, and leave credentials/project boundaries isolated. `api-discovery/` contains templates, not an activated integration.

If this project involves MLM/network selling, member recruitment rewards, funeral cover, insurance or other regulated financial-product distribution, use `regulated-distribution-compliance/SKILL.md` from the shared S2 skills repo when accessible. Determine jurisdiction and require evidence and qualified expert review before enabling regulated operations. Do not apply the South African funeral module to unrelated projects.

No new spending, subscriptions, billable API calls, production deployments, destructive changes, SSH or force pushes without separate project-specific authorization. Do not inherit S2 Tech merchant/provider credentials, infrastructure, budgets or business rules. Do not claim static documentation checks prove a deployed service.
