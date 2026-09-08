(() => {
    const slides = [...document.querySelectorAll('.slide')];
    if (!slides.length) return;
    const previous = document.querySelector('.nav-prev');
    const next = document.querySelector('.nav-next');
    const counter = document.querySelector('.slide-counter');
    const progress = document.querySelector('.progress-fill');
    let current = 0;
    function show(index) {
        current = Math.max(0, Math.min(index, slides.length - 1));
        slides.forEach((slide, i) => { slide.hidden = i !== current; });
        if (previous) previous.disabled = current === 0;
        if (next) next.disabled = current === slides.length - 1;
        if (counter) {
            counter.setAttribute('role', 'status');
            counter.textContent = `${current + 1} / ${slides.length}`;
        }
        if (progress) progress.style.width = `${(current + 1) / slides.length * 100}%`;
    }
    previous?.addEventListener('click', () => show(current - 1));
    next?.addEventListener('click', () => show(current + 1));
    document.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input, textarea, select, button, a, summary, [contenteditable]')) return;
        const target = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 }[event.key];
        if (target !== undefined) { event.preventDefault(); show(target); }
    });
    let closedNotes = [];
    window.addEventListener('beforeprint', () => {
        closedNotes = [...document.querySelectorAll('.slide details:not([open])')];
        closedNotes.forEach((notes) => { notes.open = true; });
    });
    window.addEventListener('afterprint', () => {
        closedNotes.forEach((notes) => { notes.open = false; });
        closedNotes = [];
    });
    show(0);
})();
