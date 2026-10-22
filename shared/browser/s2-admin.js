/* S2 Admin: framework-neutral, app-configured shell. No tenant data or auth service in the core. */
(function (root) {
  'use strict';
  const VERSION = '0.1.0';
  const doc = root.document;
  function element(tag, className, text) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }
  function link(href, className, text) {
    const node = element('a', className, text);
    node.href = href;
    if (/^https?:\/\//i.test(href)) {
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
    }
    return node;
  }
  function button(id, className, label, text) {
    const node = element('button', className, text);
    node.id = id;
    node.type = 'button';
    node.setAttribute('aria-label', label);
    return node;
  }
  function currentPage(config) {
    const current = root.location.pathname;
    return (config.pages || []).find(page => page.path === current) ||
      { title: config.defaultTitle || config.appName || 'Dashboard' };
  }
  function buildNavigation(config) {
    const nav = element('nav', 'sidebar-scroll');
    nav.setAttribute('aria-label', 'Application navigation');
    for (const section of config.navigation || []) {
      const heading = element('p', 'nav-kicker', section.label || 'WORKSPACE');
      nav.append(heading);
      for (const item of section.items || []) {
        if (!item.href || !item.label) continue;
        const active = item.href.split('#')[0] === root.location.pathname ||
          (item.href === '/dashboard' && root.location.pathname === '/');
        const a = link(item.href, 'nav-link' + (active ? ' selected' : ''));
        if (active) a.setAttribute('aria-current', 'page');
        if (item.navKey) a.dataset.nav = item.navKey;
        a.append(element('span', 'nav-icon', item.icon || '•'), element('span', 'nav-copy', item.label));
        if (item.countId) {
          const count = element('span', 'nav-count', '—');
          count.id = item.countId;
          a.append(count);
        }
        nav.append(a);
      }
      if (section.dynamicSlot) {
        const slot = element('div', 's2a-nav-slot');
        slot.id = section.dynamicSlot;
        nav.append(slot);
      }
    }
    return nav;
  }
  function buildSidebar(config) {
    const aside = element('aside', 'sidebar');
    aside.id = 'sidebar';
    aside.setAttribute('aria-label', 'Main navigation');
    const top = element('div', 'sidebar-top');
    const brand = link(config.home || '/dashboard', 'side-brand');
    brand.setAttribute('aria-label', (config.appName || 'S2 Admin') + ' home');
    const shell = element('span', 'logo-shell');
    if (config.logo) {
      const img = element('img');
      img.src = config.logo;
      img.alt = '';
      shell.append(img);
    } else shell.append(element('strong', '', 'S2'));
    const copy = element('span', 'side-brand-copy');
    copy.append(element('strong', '', config.brandName || 'S2 ADMIN'),
      element('small', '', config.appName || 'ADMIN CONSOLE'));
    brand.append(shell, copy);
    const collapse = button('collapse-sidebar', 'icon-button collapse', 'Collapse sidebar', '⇤');
    top.append(brand, collapse);
    const bottom = element('div', 'sidebar-bottom');
    if (config.externalLink) {
      const external = link(config.externalLink.href, 'nav-link');
      external.append(element('span', 'nav-icon', '↗'), element('span', 'nav-copy', config.externalLink.label));
      bottom.append(external);
    }
    const account = element('div', 'account');
    const accountToggle = button('account-toggle', 'account-toggle', 'Account menu');
    accountToggle.setAttribute('aria-haspopup', 'true');
    accountToggle.setAttribute('aria-expanded', 'false');
    const avatar = element('span', 'avatar', 'S'); avatar.id = 'avatar';
    const details = element('span', 'account-data');
    const name = element('strong', '', config.accountPlaceholder || 'S2 Tech'); name.id = 'account-name';
    const email = element('small', '', 'Authenticated workspace'); email.id = 'account-email';
    details.append(name, email);
    accountToggle.append(avatar, details, element('span', 'caret', '⌄'));
    const menu = element('div', 'account-menu'); menu.id = 'account-menu'; menu.hidden = true;
    const caption = element('span', 'menu-eyebrow', 'SIGNED IN AS');
    const menuEmail = element('strong'); menuEmail.id = 'menu-email';
    const themeButton = button('theme-toggle', '', 'Switch colour theme');
    const themeLabel = element('span', '', 'Switch theme'); themeLabel.id = 'theme-label';
    themeButton.append(element('span', '', '◐'), themeLabel);
    const signOut = button('sign-out', '', 'Sign out');
    signOut.append(element('span', '', '⇥'), doc.createTextNode(' Sign out'));
    menu.append(caption, menuEmail, themeButton, signOut);
    account.append(accountToggle, menu);
    bottom.append(account);
    aside.append(top, buildNavigation(config), bottom);
    return aside;
  }
  function buildHeader(config) {
    const header = element('header', 'topbar');
    const left = element('div', 'topbar-left');
    const mobile = button('mobile-menu', 'icon-button mobile-menu', 'Open navigation', '☰');
    const crumb = element('div', 'breadcrumb');
    crumb.append(element('span', '', config.breadcrumb || config.appName || 'S2 ADMIN'),
      element('b', '', '/'), element('strong', '', currentPage(config).title));
    left.append(mobile, crumb);
    const right = element('div', 'topbar-right');
    const env = element('span', 'environment');
    env.append(element('span', 'pulse'), doc.createTextNode(' ' + (config.environment || 'PRIVATE WORKSPACE')));
    right.append(env, button(config.themeButtonId || 'quick-theme', 'icon-button top-theme', 'Toggle colour theme', '◐'));
    const avatar = element('span', 'top-avatar', 'S'); avatar.id = 'top-avatar'; right.append(avatar);
    header.append(left, right);
    return header;
  }
  function setTheme(config, value) {
    const next = value === 'light' ? 'light' : 'dark';
    doc.documentElement.dataset.theme = next;
    const label = doc.getElementById('theme-label');
    if (label) label.textContent = next === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    try { root.localStorage.setItem(config.themeStorageKey || 's2admin:theme:' + config.id, next); } catch {}
    return next;
  }
  function bindControls(config) {
    if (config.legacyControls) return;
    const workspace = doc.getElementById('workspace');
    const account = doc.getElementById('account-toggle');
    const menu = doc.getElementById('account-menu');
    const closeMobile = () => workspace.classList.remove('mobile-open');
    const setCurrentTheme = () => setTheme(config, doc.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    for (const id of ['theme-toggle', config.themeButtonId || 'quick-theme']) {
      doc.getElementById(id)?.addEventListener('click', setCurrentTheme);
    }
    doc.getElementById('collapse-sidebar')?.addEventListener('click', () => {
      const collapsed = workspace.classList.toggle('compact');
      try { root.localStorage.setItem('s2admin:sidebar:' + config.id, String(collapsed)); } catch {}
      doc.getElementById('collapse-sidebar').setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    });
    doc.getElementById('mobile-menu')?.addEventListener('click', () => workspace.classList.add('mobile-open'));
    doc.getElementById('mobile-backdrop')?.addEventListener('click', closeMobile);
    doc.getElementById('sidebar')?.addEventListener('click', event => {
      if (event.target.closest('a')) closeMobile();
    });
    account?.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      account.setAttribute('aria-expanded', String(!menu.hidden));
    });
    doc.addEventListener('click', event => {
      if (!event.target.closest('.account')) {
        menu.hidden = true;
        account.setAttribute('aria-expanded', 'false');
      }
    });
    doc.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeMobile(); menu.hidden = true; }
    });
    doc.getElementById('sign-out')?.addEventListener('click', async () => {
      if (typeof config.onSignOut === 'function') return config.onSignOut();
      if (!config.logoutEndpoint) return;
      const response = await root.fetch(config.logoutEndpoint, { method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => null);
      if (response?.ok) root.location.assign(config.signOutRedirect || '/');
    });
    try {
      if (root.localStorage.getItem('s2admin:sidebar:' + config.id) === 'true') workspace.classList.add('compact');
      setTheme(config, root.localStorage.getItem(config.themeStorageKey || 's2admin:theme:' + config.id) || config.defaultTheme);
    } catch { setTheme(config, config.defaultTheme); }
  }
  function adaptLayout() {
    let workspace = doc.querySelector('.workspace');
    if (workspace) return workspace;
    // Adapt a specialist application without touching its page-content or data logic.
    const legacy = doc.querySelector('.wa-layout');
    if (legacy) {
      legacy.classList.remove('wa-layout');
      legacy.classList.add('workspace');
      legacy.id = 'workspace';
      const sidebar = legacy.querySelector('.wa-side');
      const page = legacy.querySelector('.wa-main');
      const header = page?.querySelector('.wa-top');
      sidebar?.classList.add('sidebar');
      if (sidebar) sidebar.id = 'sidebar';
      page?.classList.add('page-area');
      header?.classList.add('topbar');
      workspace = legacy;
    } else {
      const main = doc.body.querySelector(':scope > main');
      const oldHeader = doc.body.querySelector(':scope > header');
      if (main && oldHeader) {
        workspace = element('div', 'workspace');
        workspace.id = 'workspace';
        const sidebar = element('aside', 'sidebar'); sidebar.id = 'sidebar';
        const area = element('div', 'page-area');
        area.append(oldHeader, main);
        const footer = doc.body.querySelector(':scope > footer');
        if (footer) area.append(footer);
        workspace.append(sidebar, area);
        doc.body.append(workspace);
      }
    }
    if (workspace && !doc.getElementById('mobile-backdrop')) {
      const backdrop = button('mobile-backdrop', 'mobile-backdrop', 'Close navigation');
      backdrop.hidden = true;
      workspace.append(backdrop);
    }
    return workspace;
  }
  function mountImmersive(config) {
    if (doc.querySelector('.s2a-immersive-dock')) return true;
    const nav = element('nav', 's2a-immersive-dock');
    nav.setAttribute('aria-label', (config.appName || 'Admin') + ' tool navigation');
    const home = link(config.home || '/dashboard', 's2a-dock-home', '← ' + (config.brandName || 'S2 Admin'));
    nav.append(home);
    const toggle = button('s2a-dock-toggle', 's2a-dock-toggle', 'Toggle workspace navigation', '☰');
    toggle.setAttribute('aria-expanded', 'false');
    const links = element('div', 's2a-dock-links'); links.hidden = true;
    for (const section of config.navigation || []) {
      for (const item of section.items || []) links.append(link(item.href, '', item.label));
    }
    toggle.addEventListener('click', () => {
      links.hidden = !links.hidden;
      toggle.setAttribute('aria-expanded', String(!links.hidden));
    });
    nav.append(toggle, links);
    doc.body.append(nav);
    doc.body.classList.add('s2a-immersive');
    return true;
  }
  function mount(config) {
    if (!config || typeof config !== 'object' || !config.id) throw new Error('S2 Admin requires a project id');
    if (config.immersive) return mountImmersive(config);
    const workspace = adaptLayout();
    const sidebar = workspace?.querySelector('.sidebar');
    const header = workspace?.querySelector('.topbar');
    if (!workspace || !sidebar || !header) return false;
    if (workspace.dataset.s2adminVersion) return true;
    // A single shared component implementation; the host supplies routes, identity and features.
    sidebar.replaceWith(buildSidebar(config));
    header.replaceWith(buildHeader(config));
    doc.body.classList.add('s2-admin');
    doc.body.dataset.s2adminProject = config.id;
    workspace.dataset.s2adminVersion = VERSION;
    bindControls(config);
    return true;
  }
  const components = Object.freeze({
    card(title, content) {
      const node = element('section', 's2a-card');
      node.append(element('h3', 's2a-card-title', title), element('p', 's2a-card-body', content));
      return node;
    },
    emptyState(title, description) {
      const node = element('div', 's2a-empty');
      node.append(element('strong', '', title), element('p', '', description));
      return node;
    },
    button(label, variant = 'primary') {
      return button('', 's2a-button s2a-button-' + (variant === 'secondary' ? 'secondary' : 'primary'), label, label);
    }
  });
  root.S2Admin = Object.freeze({ version: VERSION, mount, setTheme, components });
  function autoMount() {
    if (root.S2AdminConfig) {
      const page = currentPage(root.S2AdminConfig);
      mount({ ...root.S2AdminConfig, legacyControls: page.legacyControls ?? root.S2AdminConfig.legacyControls,
        themeButtonId: page.themeButtonId || 'quick-theme' });
    }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', autoMount, { once: true });
  else autoMount();
})(window);
