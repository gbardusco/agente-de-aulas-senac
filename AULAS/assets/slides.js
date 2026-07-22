/* ========================================
   SLIDES — Sistema de Navegação UC14
   Controles: ← → / Click / Swipe
   ======================================== */

(function () {
    'use strict';

    const slides = document.querySelectorAll('.slide');
    const progressFill = document.querySelector('.progress-fill');
    const counter = document.querySelector('.slide-counter');
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    const total = slides.length;
    let current = 0;
    let touchStartX = 0;

    function showSlide(index) {
        if (index < 0 || index >= total) return;
        slides[current].classList.remove('active');
        current = index;
        slides[current].classList.add('active');
        if (progressFill) progressFill.style.width = ((current + 1) / total * 100) + '%';
        if (counter) counter.textContent = (current + 1) + ' / ' + total;
    }

    function next() { showSlide(current + 1); }
    function prev() { showSlide(current - 1); }

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
        if (e.key === 'Home') { e.preventDefault(); showSlide(0); }
        if (e.key === 'End') { e.preventDefault(); showSlide(total - 1); }
    });

    // Button navigation
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Touch / swipe
    document.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; });
    document.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    });

    // Init
    showSlide(0);
})();
