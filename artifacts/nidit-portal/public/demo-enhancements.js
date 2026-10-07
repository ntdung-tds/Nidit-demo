(() => {
  const CRM_PATH = '#/quan-tri';
  const CONTACT_PATH = '#/lien-he';

  const isMobile = () => window.matchMedia('(max-width: 639px)').matches;
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();

  function patchMobileMasthead() {
    if (!isMobile()) return;
    const el = document.querySelector('[data-testid="text-site-name"]');
    if (!el) return;
    const current = text(el).toLowerCase();
    if (!current.includes('viện công nghệ số') || !current.includes('chuyển đổi số quốc gia')) return;
    if (el.dataset.mobileTwoLine === '1') return;
    el.innerHTML = '<span style="display:block">Viện Công nghệ số</span><span style="display:block">và Chuyển đổi số quốc gia</span>';
    el.dataset.mobileTwoLine = '1';
  }

  function patchMobileCrmLink() {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return;
    const contact = Array.from(dialog.querySelectorAll('a')).find((a) => {
      const href = a.getAttribute('href') || '';
      return href.includes('/lien-he') || text(a).toLowerCase().includes('liên hệ');
    });
    if (!contact) return;

    if (!dialog.querySelector('[data-demo-crm-inline="1"]')) {
      const sourceLi = contact.closest('li');
      if (sourceLi && sourceLi.parentElement) {
        const li = document.createElement('li');
        li.dataset.demoCrmInline = '1';
        li.innerHTML = `<a href="${CRM_PATH}" class="${contact.className}">Quản trị / CRM</a>`;
        sourceLi.insertAdjacentElement('afterend', li);
      } else {
        const a = document.createElement('a');
        a.dataset.demoCrmInline = '1';
        a.href = CRM_PATH;
        a.className = contact.className;
        a.textContent = 'Quản trị / CRM';
        contact.insertAdjacentElement('afterend', a);
      }
    }

    Array.from(dialog.querySelectorAll('a,button')).forEach((el) => {
      const t = text(el).toLowerCase();
      if (t === 'đăng nhập / quản trị crm' || t === 'mở quản trị / crm' || t === 'sign in / admin crm' || t === 'open admin / crm') {
        const box = el.closest('.border-t');
        if (box && !box.querySelector('[data-demo-crm-inline="1"]')) box.style.display = 'none';
      }
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
    patchMobileCrmLink();
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
