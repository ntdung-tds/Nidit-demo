(() => {
  const CONTACT_PATH = '#/lien-he';
  const CRM_PATH = '#/quan-tri';
  const ORG_PATH = '#/gioi-thieu/co-cau-to-chuc';
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const lower = (el) => text(el).toLocaleLowerCase('vi-VN');
  const isMobile = () => window.matchMedia('(max-width: 639px)').matches;
  const isDesktopNav = () => window.matchMedia('(min-width: 1280px)').matches;

  function patchMobileMasthead() {
    if (!isMobile()) return;
    const el = document.querySelector('[data-testid="text-site-name"]');
    if (!el) return;
    const spans = el.querySelectorAll('span.sm\\:hidden');
    if (spans.length < 2) return;
    const logoLink = el.closest('[data-testid="link-home-logo"]');
    if (logoLink) logoLink.style.flex = '1 1 auto';
    const textWrap = el.parentElement;
    if (textWrap) { textWrap.style.flex = '1 1 auto'; textWrap.style.minWidth = '0'; }
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

  function buildCrmHref(contactHref) {
    if (!contactHref) return CRM_PATH;
    if (contactHref.includes('#/')) return contactHref.replace(/#\/[^?#]*/, CRM_PATH);
    return CRM_PATH;
  }

  function patchDesktopLogin() {
    const existing = document.querySelector('[data-demo-desktop-login="1"]');
    if (!isDesktopNav()) {
      existing?.closest('[data-demo-desktop-login-row]')?.remove();
      return;
    }
    if (existing) return;

    const homeLink = document.querySelector('[data-testid="link-nav-home"]');
    const navList = homeLink?.closest('ul');
    const navContainer = navList?.parentElement;
    if (!navList || !navContainer) return;

    const login = document.createElement('a');
    login.dataset.demoDesktopLogin = '1';
    login.href = CRM_PATH;
    login.textContent = 'Đăng nhập';
    login.setAttribute('data-testid', 'link-desktop-login');
    login.style.height = '44px';
    login.style.display = 'inline-flex';
    login.style.alignItems = 'center';
    login.style.justifyContent = 'center';
    login.style.flexShrink = '0';
    login.style.padding = '0 14px';
    login.style.marginLeft = '0';
    login.style.fontSize = '0.8rem';
    login.style.fontWeight = '700';
    login.style.textTransform = 'uppercase';
    login.style.letterSpacing = '0.03em';
    login.style.color = '#fff';
    login.style.textDecoration = 'none';
    login.style.borderLeft = '1px solid rgba(255,255,255,.16)';
    login.addEventListener('mouseenter', () => { login.style.background = 'rgba(255,255,255,.1)'; });
    login.addEventListener('mouseleave', () => { login.style.background = ''; });
    const row = document.createElement('li');
    row.dataset.demoDesktopLoginRow = '1';
    row.style.display = 'flex';
    row.appendChild(login);
    const contact = Array.from(navList.children).find((item) =>
      Array.from(item.querySelectorAll(':scope > a')).some((link) =>
        link.getAttribute('href')?.endsWith('/lien-he')));
    if (contact) contact.insertAdjacentElement('afterend', row);
    else navList.appendChild(row);
  }

  function patchMobileLoginRow() {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return;

    // Component gốc đang chèn link quản trị cả ở mục Liên hệ lồng trong Giới thiệu
    // và ở mục Liên hệ cấp chính. Chỉ xóa chính link/nút quản trị, tuyệt đối không
    // xóa <li> cha vì <li> đó còn chứa mục menu hợp lệ.
    dialog.querySelectorAll('[data-testid="link-mobile-admin-inline"]').forEach((el) => el.remove());
    Array.from(dialog.querySelectorAll('button')).forEach((el) => {
      const label = lower(el);
      if (label === 'đăng xuất quản trị' || label === 'sign out of admin') el.remove();
    });

    // Dọn các hàng được tạo bởi những bản demo-enhancements cũ.
    dialog.querySelectorAll('[data-demo-account-row="1"]').forEach((el) => el.remove());

    const legacyLabels = new Set([
      'quản trị viên demo', 'quản trị / crm', 'đăng nhập / quản trị crm', 'mở quản trị / crm',
      'admin / crm', 'sign in / admin crm', 'open admin / crm',
    ]);
    Array.from(dialog.querySelectorAll('a,button')).forEach((el) => {
      if (el.closest('[data-demo-login-row="1"]')) return;
      if (legacyLabels.has(lower(el))) el.remove();
    });

    // Chỉ chọn mục Liên hệ cấp chính (nhãn chính xác "Liên hệ"), không chọn
    // "Thông tin liên hệ, đầu mối" nằm trong nhóm Giới thiệu.
    const contact = Array.from(dialog.querySelectorAll('a')).find((a) => lower(a) === 'liên hệ');
    if (!contact) return;
    const contactLi = contact.closest('li');
    if (!contactLi || !contactLi.parentElement) return;

    let row = dialog.querySelector('[data-demo-login-row="1"]');
    if (!row) {
      row = document.createElement('li');
      row.dataset.demoLoginRow = '1';
      row.className = contactLi.className;
      const login = document.createElement('a');
      login.href = buildCrmHref(contact.getAttribute('href'));
      login.className = contact.className;
      login.textContent = 'Đăng nhập';
      login.setAttribute('data-testid', 'link-mobile-login-after-contact');
      row.appendChild(login);
    } else {
      const existingLink = row.querySelector('a');
      if (existingLink) {
        existingLink.href = buildCrmHref(contact.getAttribute('href'));
        existingLink.textContent = 'Đăng nhập';
        existingLink.className = contact.className;
      }
      row.className = contactLi.className;
    }

    // Luôn đặt đúng ngay sau Liên hệ cấp chính, không nằm trong nhóm Giới thiệu
    // và cũng không rơi xuống vùng điều khiển/ngôn ngữ phía cuối menu.
    if (row.previousElementSibling !== contactLi) contactLi.insertAdjacentElement('afterend', row);
  }

  function patchOrgLeadershipChart() {
    if (!location.hash.startsWith(ORG_PATH)) return;
    if (document.querySelector('[data-demo-deputy-leaders="1"]')) return;
    const leadershipLabel = Array.from(document.querySelectorAll('div')).find((el) => lower(el) === 'lãnh đạo viện');
    if (!leadershipLabel) return;
    const topCard = leadershipLabel.closest('.border-2');
    const chart = topCard?.parentElement;
    if (!topCard || !chart) return;
    const horizontalLine = Array.from(chart.children).find((el) => el.classList?.contains('h-px'));
    if (!horizontalLine) return;

    const deputies = document.createElement('div');
    deputies.dataset.demoDeputyLeaders = '1';
    deputies.style.width = '75%';
    deputies.style.display = 'grid';
    deputies.style.gridTemplateColumns = 'repeat(2,minmax(0,1fr))';
    deputies.style.gap = '12px';
    deputies.style.alignItems = 'start';
    [['Trần Quốc Hưng', 'Phó Viện trưởng'], ['Lê Thị Minh Phương', 'Phó Viện trưởng']].forEach(([name, position]) => {
      const branch = document.createElement('div');
      branch.style.display = 'flex';
      branch.style.minWidth = '0';
      branch.style.flexDirection = 'column';
      branch.style.alignItems = 'center';
      branch.innerHTML = `<div style="height:24px;width:1px;background:#173f7a"></div><div style="width:100%;box-sizing:border-box;border:2px solid #173f7a;background:#fff;padding:11px 8px;text-align:center;color:#102b55"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#b42318">${position}</div><div style="margin-top:4px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(11px,2.8vw,14px);font-weight:700;line-height:1.25">${name}</div></div>`;
      deputies.appendChild(branch);
    });
    horizontalLine.insertAdjacentElement('afterend', deputies);
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
    wrap.innerHTML = `<form data-contact-demo-form style="display:block"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:0 16px">${field('Họ và tên', 'fullName', 'text', true)}${field('Email', 'email', 'email', true)}${field('Điện thoại', 'phone')}${field('Cơ quan, đơn vị', 'organization')}</div>${field('Tiêu đề', 'subject')}<label style="display:block;font-size:12px;font-weight:600;margin-bottom:14px">Nội dung <span style="color:#b42318">*</span><textarea name="message" required rows="5" style="display:block;width:100%;margin-top:6px;border:1px solid #cfd4dc;background:#fff;padding:10px 11px;font:inherit;box-sizing:border-box;resize:vertical"></textarea></label><div data-contact-demo-error style="display:none;color:#b42318;font-size:12px;margin:-4px 0 12px"></div><div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px"><button type="submit" style="border:0;background:#173f7a;color:#fff;padding:10px 16px;font-weight:700;cursor:pointer">Gửi yêu cầu</button><span style="font-size:11px;color:#667085">Bản demo: dữ liệu chỉ được xử lý tạm thời trên trình duyệt, không lưu lên máy chủ.</span></div></form>`;
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
      if (msg) { err.textContent = msg; err.style.display = 'block'; return; }
      const code = `NIDIT-DEMO-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.floor(1000 + Math.random()*9000)}`;
      wrap.innerHTML = `<div style="border:1px solid #93a9c7;background:#f2f6fb;padding:20px"><div style="font-size:18px;font-weight:700;color:#173f7a">Đã tiếp nhận yêu cầu demo</div><p style="margin:8px 0 0;font-size:13px;color:#5d6675">Thông tin đã được kiểm tra hợp lệ trên trình duyệt. Bản demo không ghi dữ liệu vào hệ thống thật.</p><div style="display:inline-block;margin-top:14px;border:1px dashed #173f7a;background:#fff;padding:8px 12px;font-weight:700;color:#173f7a">${code}</div></div>`;
    });
  }

  function patchContactMap() {
    if (!location.hash.startsWith(CONTACT_PATH)) return;
    const mapFallback = Array.from(document.querySelectorAll('.img-fallback')).find((el) => el.querySelector('svg'));
    if (!mapFallback || mapFallback.dataset.demoMap === '1') return;
    const container = mapFallback.parentElement;
    if (!container) return;
    const contactBlock = Array.from(document.querySelectorAll('ul')).find((ul) => text(ul).includes('Email') || ul.querySelector('a[href^="mailto:"]'));
    const address = contactBlock ? text(contactBlock.querySelector('li')) : 'Hà Nội, Việt Nam';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(address || 'Hà Nội, Việt Nam')}&output=embed`;
    iframe.title = 'Bản đồ vị trí Viện'; iframe.loading = 'lazy'; iframe.referrerPolicy = 'no-referrer-when-downgrade'; iframe.style.width = '100%'; iframe.style.height = '100%'; iframe.style.border = '0'; iframe.dataset.demoMap = '1';
    container.replaceChildren(iframe);
  }

  function patchAll() {
    patchMobileMasthead();
    patchDesktopLogin();
    patchMobileLoginRow();
    patchOrgLeadershipChart();
    patchContactForm();
    patchContactMap();
  }
  let scheduled = false;
  const schedulePatch = () => { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; patchAll(); }); };
  const observer = new MutationObserver(schedulePatch);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(schedulePatch, 20));
  window.addEventListener('resize', schedulePatch);
  document.addEventListener('DOMContentLoaded', schedulePatch);
  schedulePatch();
})();