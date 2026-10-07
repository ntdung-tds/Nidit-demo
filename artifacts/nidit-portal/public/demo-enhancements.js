(() => {
  const CONTACT_PATH = '#/lien-he';
  const CRM_PATH = '#/quan-tri';
  const SESSION_KEY = 'nidit_crm_demo_session_v1';
  const ADMIN_TOKEN_KEY = 'nidit_admin_token';
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const isMobile = () => window.matchMedia('(max-width: 639px)').matches;

  function patchMobileMasthead() {
    if (!isMobile()) return;
    const el = document.querySelector('[data-testid="text-site-name"]');
    if (!el) return;
    const spans = el.querySelectorAll('span.sm\\:hidden');
    if (spans.length < 2) return;

    const logoLink = el.closest('[data-testid="link-home-logo"]');
    if (logoLink) logoLink.style.flex = '1 1 auto';
    const textWrap = el.parentElement;
    if (textWrap) {
      textWrap.style.flex = '1 1 auto';
      textWrap.style.minWidth = '0';
    }

    el.style.lineHeight = '1.22';
    el.style.width = '100%';

    spans[0].style.fontSize = 'clamp(0.84rem, 4vw, 1.04rem)';
    spans[0].style.letterSpacing = '-0.012em';
    spans[0].style.lineHeight = '1.14';

    spans[1].style.fontSize = 'clamp(0.84rem, 4vw, 1.04rem)';
    spans[1].style.letterSpacing = '-0.018em';
    spans[1].style.lineHeight = '1.14';
    spans[1].style.marginTop = '0.12em';
  }

  function isAdminSession() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1' || !!localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return false;
    }
  }

  function clearAdminSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {
      // no-op for restricted storage contexts
    }
  }

  function hideLegacyAdminRows(dialog) {
    const labels = new Set([
      'quản trị / crm',
      'đăng nhập / quản trị crm',
      'mở quản trị / crm',
      'đăng xuất quản trị',
      'admin / crm',
      'sign in / admin crm',
      'open admin / crm',
      'sign out of admin',
    ]);

    dialog.querySelectorAll('a,button').forEach((el) => {
      if (el.closest('[data-demo-account-row="1"]')) return;
      const label = text(el).toLowerCase();
      if (!labels.has(label)) return;
      const li = el.closest('li');
      if (li && text(li).toLowerCase() === label) li.style.display = 'none';
      else el.style.display = 'none';
    });
  }

  function patchMobileAccountMenu() {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return;

    hideLegacyAdminRows(dialog);

    const contact = Array.from(dialog.querySelectorAll('a')).find((a) => {
      const href = a.getAttribute('href') || '';
      const label = text(a).toLowerCase();
      return href.includes('/lien-he') || label.includes('thông tin liên hệ') || label === 'liên hệ';
    });
    if (!contact) return;

    const contactLi = contact.closest('li');
    if (!contactLi || !contactLi.parentElement) return;

    let row = dialog.querySelector('[data-demo-account-row="1"]');
    if (!row) {
      row = document.createElement('li');
      row.dataset.demoAccountRow = '1';
      row.style.position = 'relative';
      contactLi.insertAdjacentElement('afterend', row);
    } else if (row.previousElementSibling !== contactLi) {
      contactLi.insertAdjacentElement('afterend', row);
    }

    const loggedIn = isAdminSession();
    if (!loggedIn) {
      row.innerHTML = `<a href="${CRM_PATH}" class="${contact.className}">Đăng nhập / Quản trị CRM</a>`;
      return;
    }

    row.innerHTML = `
      <button type="button" data-demo-account-toggle="1" class="${contact.className}" style="display:flex;width:100%;align-items:center;justify-content:space-between;text-align:left;border:0;background:transparent;cursor:pointer">
        <span>Quản trị viên demo</span><span aria-hidden="true" style="font-size:12px;opacity:.55">⌄</span>
      </button>
      <div data-demo-account-actions="1" style="display:none;padding:0 0 8px 0">
        <a href="${CRM_PATH}" style="display:block;padding:6px 16px 6px 32px;font-size:14px;color:#596273;text-decoration:none">Mở Quản trị / CRM</a>
        <button type="button" data-demo-logout="1" style="display:block;width:100%;border:0;background:transparent;padding:6px 16px 6px 32px;text-align:left;font:inherit;font-size:14px;color:#596273;cursor:pointer">Đăng xuất</button>
      </div>`;

    const toggle = row.querySelector('[data-demo-account-toggle="1"]');
    const actions = row.querySelector('[data-demo-account-actions="1"]');
    toggle?.addEventListener('click', () => {
      if (!actions) return;
      actions.style.display = actions.style.display === 'none' ? 'block' : 'none';
    });

    row.querySelector('[data-demo-logout="1"]')?.addEventListener('click', () => {
      clearAdminSession();
      row.innerHTML = `<a href="${CRM_PATH}" class="${contact.className}">Đăng nhập / Quản trị CRM</a>`;
    });
  }

  function field(label, name, type = 'text', required = false) {
    return `<label style="display:block;font-size:12px;font-weight:600;margin-bottom:14px">${label}${required ? ' <span style="color:#b42318">*</span>' : ''}<input name="${name}" type="${type}" ${required ? 'required' : ''} style="display:block;width:100%;margin-top:6px;border:1px solid #cfd4dc;background:#fff;padding:10px 11px;font:inherit;box-sizing:border-box" /></label>`;
  }

  function patchContactForm() {
    if (!location.hash.startsWith(CONTACT_PATH)) return;
    const note = Array.from(document.querySelectorAll('[role="note"],div')).find((el) => text(el).startsWith('Biểu mẫu đã tắt trong bản demo tĩnh'));
    if (!note || note.dataset.demoContactForm === '1') return;

    const wrap = document.createElement('div');
    wrap.dataset.demoContactForm = '1';
    wrap.innerHTML = `
      <form data-contact-demo-form style="display:block">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:0 16px">
          ${field('Họ và tên', 'fullName', 'text', true)}
          ${field('Email', 'email', 'email', true)}
          ${field('Điện thoại', 'phone')}
          ${field('Cơ quan, đơn vị', 'organization')}
        </div>
        ${field('Tiêu đề', 'subject')}
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:14px">Nội dung <span style="color:#b42318">*</span><textarea name="message" required rows="5" style="display:block;width:100%;margin-top:6px;border:1px solid #cfd4dc;background:#fff;padding:10px 11px;font:inherit;box-sizing:border-box;resize:vertical"></textarea></label>
        <div data-contact-demo-error style="display:none;color:#b42318;font-size:12px;margin:-4px 0 12px"></div>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px">
          <button type="submit" style="border:0;background:#173f7a;color:#fff;padding:10px 16px;font-weight:700;cursor:pointer">Gửi yêu cầu</button>
          <span style="font-size:11px;color:#667085">Bản demo: dữ liệu chỉ được xử lý tạm thời trên trình duyệt, không lưu lên máy chủ.</span>
        </div>
      </form>`;
    note.replaceWith(wrap);

    const form = wrap.querySelector('form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get('fullName') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const message = String(fd.get('message') || '').trim();
      const err = wrap.querySelector('[data-contact-demo-error]');
      let msg = '';
      if (!name) msg = 'Vui lòng nhập họ và tên.';
      else if (!/^\S+@\S+\.\S+$/.test(email)) msg = 'Email chưa đúng định dạng.';
      else if (message.length < 10) msg = 'Nội dung cần tối thiểu 10 ký tự.';
      if (msg) {
        err.textContent = msg;
        err.style.display = 'block';
        return;
      }
      const code = `NIDIT-DEMO-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.floor(1000 + Math.random()*9000)}`;
      wrap.innerHTML = `<div style="border:1px solid #93a9c7;background:#f2f6fb;padding:20px"><div style="font-size:18px;font-weight:700;color:#173f7a">Đã tiếp nhận yêu cầu demo</div><p style="margin:8px 0 0;font-size:13px;color:#5d6675">Thông tin đã được kiểm tra hợp lệ trên trình duyệt. Bản demo không ghi dữ liệu vào hệ thống thật.</p><div style="display:inline-block;margin-top:14px;border:1px dashed #173f7a;background:#fff;padding:8px 12px;font-weight:700;color:#173f7a">${code}</div></div>`;
    });
  }

  function patchContactMap() {
    if (!location.hash.startsWith(CONTACT_PATH)) return;
    const fallbacks = Array.from(document.querySelectorAll('.img-fallback'));
    const mapFallback = fallbacks.find((el) => el.querySelector('svg'));
    if (!mapFallback || mapFallback.dataset.demoMap === '1') return;
    const container = mapFallback.parentElement;
    if (!container) return;

    const contactBlock = Array.from(document.querySelectorAll('ul')).find((ul) => text(ul).includes('Email') || ul.querySelector('a[href^="mailto:"]'));
    const address = contactBlock ? text(contactBlock.querySelector('li')) : 'Hà Nội, Việt Nam';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(address || 'Hà Nội, Việt Nam')}&output=embed`;
    iframe.title = 'Bản đồ vị trí Viện';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.dataset.demoMap = '1';
    container.replaceChildren(iframe);
  }

  function patchAll() {
    patchMobileMasthead();
    patchMobileAccountMenu();
    patchContactForm();
    patchContactMap();
  }

  const observer = new MutationObserver(() => requestAnimationFrame(patchAll));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(patchAll, 20));
  window.addEventListener('resize', patchAll);
  document.addEventListener('DOMContentLoaded', patchAll);
  patchAll();
})();