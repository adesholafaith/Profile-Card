
const setupTime = () => {
  const el = document.getElementById('userTime');
  if (!el) return null;

  const tick = () => {
    // show time in milliseconds
    el.textContent = `Current time (ms): ${Date.now()}`;
  };

  tick();
  const id = setInterval(tick, 500);
  el.dataset._timeInterval = String(id);

  window.addEventListener('beforeunload', () => clearInterval(id));
  return id;
};

const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav-link');
const openIcon = document.querySelector('.open-icon');
const closeIcon = document.querySelector('.close-icon');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    const isOpen = nav.classList.contains('open');
    nav.style.display = isOpen ? 'block' : 'none';
    openIcon.style.display = isOpen ? 'none' : 'inline-block';
    closeIcon.style.display = isOpen ? 'inline-block' : 'none';
  });

  window.addEventListener('scroll', () => {
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      nav.style.display = 'none';
      openIcon.style.display = 'inline-block';
      closeIcon.style.display = 'none';
    }
  });
}


const socialFocusAnnounce = () => {
  const nodes = Array.from(document.querySelectorAll('[data-testid^="test-user-social-"]'));
  if (nodes.length === 0) return;

  nodes.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const isNativeFocusable = (tag === 'a' && el.hasAttribute('href')) || tag === 'button' || tag === 'input';
    if (!isNativeFocusable) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    }

    el.addEventListener('focus', () => el.setAttribute('aria-pressed', 'false'));
    el.addEventListener('blur', () => el.removeAttribute('aria-pressed'));

    el.addEventListener('keydown', (ev) => {
      // support Enter and Space variations across browsers
      const key = ev.key;
      const isEnter = key === 'Enter';
      const isSpace = key === ' ' || key === 'Spacebar' || key === 'Space';
      if (!isEnter && !isSpace) return;

      ev.preventDefault();
      el.setAttribute('aria-pressed', 'true');
      if (typeof el.click === 'function') el.click();
      setTimeout(() => {
        try { el.setAttribute('aria-pressed', 'false'); } catch {}
      }, 180);
    });
  });
};

// Contact form validation — accessible + keyboard friendly
const setupContactForm = () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successEl = document.getElementById('test-contact-success') || null;

  const getEl = (id) => document.getElementById(id) || null;

  const fields = {
    name: { el: getEl('name'), errorEl: getEl('test-contact-error-name') },
    email: { el: getEl('email'), errorEl: getEl('test-contact-error-email') },
    subject: { el: getEl('subject'), errorEl: getEl('test-contact-error-subject') },
    message: { el: getEl('message'), errorEl: getEl('test-contact-error-message') }
  };

  const isValidEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const attachDescribedBy = (inputEl, errorEl) => {
    if (!inputEl || !errorEl) return;
    const ids = (inputEl.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!ids.includes(errorEl.id)) ids.push(errorEl.id);
    inputEl.setAttribute('aria-describedby', ids.join(' '));
  };

  const showError = (key, msg) => {
    const f = fields[key];
    if (!f || !f.el || !f.errorEl) return;
    f.errorEl.textContent = msg;
    f.el.setAttribute('aria-invalid', 'true');
    attachDescribedBy(f.el, f.errorEl);
  };

  const clearError = (key) => {
    const f = fields[key];
    if (!f || !f.el || !f.errorEl) return;
    f.errorEl.textContent = '';
    f.el.setAttribute('aria-invalid', 'false');
  };

  const subjectIsValid = (v) => {
    if (!v) return false;
    const low = String(v).trim().toLowerCase();
    return low !== '' && low !== 'select';
  };

  const validate = () => {
    let ok = true;

    const nameVal = fields.name.el ? fields.name.el.value.trim() : '';
    if (!nameVal) { showError('name', 'Full name is required.'); ok = false; } else clearError('name');

    const emailVal = fields.email.el ? fields.email.el.value.trim() : '';
    if (!emailVal) { showError('email', 'Email is required.'); ok = false; }
    else if (!isValidEmail(emailVal)) { showError('email', 'Please enter a valid email (name@example.com).'); ok = false; }
    else clearError('email');

    const subjVal = fields.subject.el ? fields.subject.el.value.trim() : '';
    if (!subjectIsValid(subjVal)) { showError('subject', 'Subject is required.'); ok = false; } else clearError('subject');

    const msgVal = fields.message.el ? fields.message.el.value.trim() : '';
    if (!msgVal) { showError('message', 'Message is required.'); ok = false; }
    else if (msgVal.length < 10) { showError('message', 'Message must be at least 10 characters.'); ok = false; }
    else clearError('message');

    return ok;
  };

  // per-field input listeners (skip if element missing)
  Object.keys(fields).forEach((key) => {
    const f = fields[key];
    if (!f || !f.el) return;
    f.el.addEventListener('input', () => {
      if (f.el.getAttribute('aria-invalid') !== 'true') return;
      const v = f.el.value.trim();
      if (key === 'name' && v) clearError('name');
      if (key === 'email' && isValidEmail(v)) clearError('email');
      if (key === 'subject' && subjectIsValid(v)) clearError('subject');
      if (key === 'message' && v.length >= 10) clearError('message');
    });

    // blur validation for quicker feedback
    f.el.addEventListener('blur', () => {
      const v = (f.el.value || '').trim();
      if (key === 'name' && !v) showError('name', 'Full name is required.');
      if (key === 'email') {
        if (!v) showError('email', 'Email is required.');
        else if (!isValidEmail(v)) showError('email', 'Please enter a valid email (name@example.com).');
      }
      if (key === 'subject' && !subjectIsValid(v)) showError('subject', 'Subject is required.');
      if (key === 'message') {
        if (!v) showError('message', 'Message is required.');
        else if (v.length < 10) showError('message', 'Message must be at least 10 characters.');
      }
    });
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (successEl) { successEl.hidden = true; }

    const ok = validate();
    if (!ok) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
      return;
    }

    // success feedback
    if (successEl) {
      successEl.hidden = false;
      if (typeof successEl.focus === 'function') successEl.focus();
    }

    form.reset();
    Object.keys(fields).forEach((k) => clearError(k));
  });
};

// initialize once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupTime();
  socialFocusAnnounce();
  setupContactForm();
});
