const setupTime = () => {
    const el = document.getElementById('userTime');
    const tick = () => {
        el.textContent = `Current time (ms) : ${Date.now().toString()}`;
    }
    tick();
    // update every 500ms
    const interval = setInterval(tick, 500);
    el.dataset._timeInterval = interval;
}
setupTime ();

const socialFocusAnnounce = () => {
    const socialLinks = document.querySelectorAll('[data-testid^="test-user-social-"]');
    socialLinks.forEach(a=>{
        a.addEventListener('focus', () => a.setAttribute('aria-pressed','false'));
        a.addEventListener('blur', () => a.removeAttribute('aria-pressed'));
    });
}
    
socialFocusAnnounce ();