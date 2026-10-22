# S2 Admin shared shell (0.1.0, unreleased)

This is a framework-neutral, reusable UI library **owned by S2 Admin**. It is not an independent admin site, a sign-in service or a copyable demo.

## Ownership
- Shared: shell, sidebar/header, navigation renderer, responsive structure, visual tokens, theme handling, cards, empty states, buttons.
- Each application: navigation data, branding, permission checks, authentication, routes, page content, database and APIs.
- Use only a versioned S2 Admin dependency in apps. Never copy the full TailAdmin demo into an application's routes.

## Browser usage
Host a pinned build of `browser/s2-admin.js` and `browser/s2-admin.css` from this package. Load a project-specific config script **before** the S2 Admin JS, and load the app-specific page script after it.

```html
<link rel="stylesheet" href="/s2-admin/s2-admin.css">
<script src="/s2-admin/config.js" defer></script>
<script src="/s2-admin/s2-admin.js" defer></script>
```

`window.S2AdminConfig` should contain `id`, `appName`, `brandName`, `logo`, `home`, `pages`, `navigation`, `environment`, `defaultTheme`. Configure `legacyControls: true` only for transitional pages with their own old shell event handlers. New integrations should use the library's shared controls. `onSignOut` or `logoutEndpoint` are application adapters.

Keep client-specific CSS custom properties in the consuming project's theme file. Shared tokens support light/dark. Auth/tenant isolation must remain server-side.

## Release strategy
Publish approved, tested immutable versions. Consumers pin versions, run smoke tests, receive automated dependency update proposals, and deploy only after validation. A change to the source worktree does **not** update production automatically. Do not serve mutable unversioned assets on production.

## License
Shared new code MIT, and TailAdmin upstream retains its own MIT licence and attribution.
