(() => {
  const links = [...document.querySelectorAll('.bubble-link')];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function colorOf(el) {
    return getComputedStyle(el).backgroundColor || '#eeeaff';
  }

  function maxScaleFor(rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const corners = [
      [0, 0], [innerWidth, 0], [0, innerHeight], [innerWidth, innerHeight]
    ];
    const farthest = Math.max(...corners.map(([x, y]) => Math.hypot(x - cx, y - cy)));
    return (farthest * 2.25) / Math.max(rect.width, rect.height);
  }

  function repelOthers(source, sourceRect) {
    const sx = sourceRect.left + sourceRect.width / 2;
    const sy = sourceRect.top + sourceRect.height / 2;
    document.querySelectorAll('.bubble').forEach((bubble) => {
      if (bubble === source) return;
      const r = bubble.getBoundingClientRect();
      const bx = r.left + r.width / 2;
      const by = r.top + r.height / 2;
      let dx = bx - sx;
      let dy = by - sy;
      const length = Math.hypot(dx, dy) || 1;
      dx /= length;
      dy /= length;
      const distance = Math.max(innerWidth, innerHeight) * 0.78;
      bubble.animate([
        { transform: getComputedStyle(bubble).transform === 'none' ? 'translate(0,0)' : getComputedStyle(bubble).transform, opacity: 1 },
        { transform: `translate(${dx * distance}px, ${dy * distance}px) scale(.72)`, opacity: 0 }
      ], { duration: 620, easing: 'cubic-bezier(.55,.02,.44,.98)', fill: 'forwards' });
    });
  }

  function transitionTo(link, event) {
    const url = link.href;
    if (!url || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (prefersReduced) return;

    event.preventDefault();
    if (document.body.classList.contains('is-transitioning')) return;
    document.body.classList.add('is-transitioning');

    const rect = link.getBoundingClientRect();
    const clone = document.createElement('div');
    clone.className = 'transition-bubble';
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.background = colorOf(link);
    clone.innerHTML = `<span>${link.textContent.trim()}</span>`;
    document.body.appendChild(clone);

    repelOthers(link, rect);
    link.style.opacity = '0';

    const scale = maxScaleFor(rect);
    try { sessionStorage.setItem('bubbleTransitionColor', colorOf(link)); } catch (_) {}
    clone.animate([
      { transform: 'scale(1)' },
      { transform: `scale(${scale})` }
    ], {
      duration: 680,
      easing: 'cubic-bezier(.7,0,.22,1)',
      fill: 'forwards'
    });

    setTimeout(() => { window.location.href = url; }, 610);
  }

  links.forEach((link) => link.addEventListener('click', (event) => transitionTo(link, event)));

  // Continue the color takeover briefly on the destination page so the transition
  // does not flash straight from a full-screen bubble to white.
  try {
    const entryColor = sessionStorage.getItem('bubbleTransitionColor');
    if (entryColor) {
      sessionStorage.removeItem('bubbleTransitionColor');
      const wash = document.createElement('div');
      wash.className = 'page-entry-wash';
      wash.style.background = entryColor;
      document.body.appendChild(wash);
      wash.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], { duration: prefersReduced ? 1 : 430, easing: 'ease-out', fill: 'forwards' });
      setTimeout(() => wash.remove(), prefersReduced ? 5 : 450);
    }
  } catch (_) {}

  // Give section pages a soft entrance after the previous bubble has filled the viewport.
  if (document.body.classList.contains('section-page')) {
    document.querySelector('.scroll-content')?.animate([
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: prefersReduced ? 1 : 520, easing: 'ease-out', fill: 'both' });
  }
})();
