(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const toast = document.querySelector('#toast');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  }

  const phrases = ['敢把想法做出来的人', '愿意和伙伴并肩的人', '想让技术真正发光的人'];
  const typeLine = document.querySelector('#type-line');
  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let deleting = true;
  const type = () => {
    if (reducedMotion) return;
    const phrase = phrases[phraseIndex];
    charIndex += deleting ? -1 : 1;
    typeLine.textContent = phrase.slice(0, charIndex);
    let delay = deleting ? 48 : 92;
    if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 420;
    } else if (!deleting && charIndex === phrases[phraseIndex].length) {
      deleting = true;
      delay = 1600;
    }
    window.setTimeout(type, delay);
  };
  window.setTimeout(type, 1600);

  const screenButton = document.querySelector('#screen-button');
  const showToast = () => {
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2400);
  };
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        showToast();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {
      toast.textContent = '浏览器阻止了全屏，请按 F11';
      showToast();
    }
  };
  screenButton.addEventListener('click', toggleFullscreen);
  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'f' && !/input|textarea/i.test(document.activeElement.tagName)) toggleFullscreen();
  });

  const awardFilm = document.querySelector('#award-film');
  const awardVideo = document.querySelector('#award-showreel');
  const awardFilmControl = document.querySelector('#award-film-control');
  const awardFilmProgress = document.querySelector('#award-film-progress');

  const setFilmControl = (state) => {
    const labels = {
      play: ['▶', 'PLAY + AUDIO', '播放含音效的十一秒荣誉速览'],
      pause: ['Ⅱ', 'PAUSE', '暂停荣誉速览'],
      replay: ['↻', 'REPLAY + AUDIO', '重新播放含音效的十一秒荣誉速览']
    };
    const [icon, label, ariaLabel] = labels[state];
    awardFilmControl.innerHTML = `<span aria-hidden="true">${icon}</span> ${label}`;
    awardFilmControl.setAttribute('aria-label', ariaLabel);
  };

  const playAwardFilm = async (restart = false) => {
    if (restart || awardVideo.ended) awardVideo.currentTime = 0;
    awardVideo.muted = false;
    try {
      await awardVideo.play();
    } catch (_) {
      setFilmControl('play');
    }
  };

  awardFilmControl.addEventListener('click', () => {
    if (awardVideo.paused) playAwardFilm(awardVideo.ended);
    else awardVideo.pause();
  });
  awardVideo.addEventListener('play', () => {
    awardFilm.classList.add('is-playing');
    setFilmControl('pause');
  });
  awardVideo.addEventListener('pause', () => {
    awardFilm.classList.remove('is-playing');
    setFilmControl(awardVideo.ended ? 'replay' : 'play');
  });
  awardVideo.addEventListener('ended', () => {
    awardFilm.classList.remove('is-playing');
    awardFilm.classList.add('is-ended');
    setFilmControl('replay');
  });
  awardVideo.addEventListener('timeupdate', () => {
    const progress = awardVideo.duration ? awardVideo.currentTime / awardVideo.duration : 0;
    awardFilmProgress.style.transform = `scaleX(${progress})`;
  });

  const rail = document.querySelector('#award-rail');
  const railCards = [...rail.querySelectorAll('.award-card')];
  const railPrev = document.querySelector('.rail-prev');
  const railNext = document.querySelector('.rail-next');
  const railProgress = document.querySelector('#rail-progress');
  const railIndex = document.querySelector('#rail-index');
  let railDragging = false;
  let railStartX = 0;
  let railStartScroll = 0;

  const updateRail = () => {
    const maxScroll = Math.max(rail.scrollWidth - rail.clientWidth, 1);
    const progress = rail.scrollLeft / maxScroll;
    railProgress.style.transform = `scaleX(${Math.max(.035, progress)})`;
    const marker = rail.scrollLeft + rail.clientWidth * .28;
    let activeIndex = 0;
    railCards.forEach((card, index) => {
      if (card.offsetLeft <= marker) activeIndex = index;
    });
    railIndex.textContent = String(activeIndex + 1).padStart(2, '0');
    railPrev.disabled = rail.scrollLeft < 4;
    railNext.disabled = rail.scrollLeft > maxScroll - 4;
  };

  const moveRail = (direction) => {
    rail.scrollBy({ left: direction * rail.clientWidth * .82, behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  railPrev.addEventListener('click', () => moveRail(-1));
  railNext.addEventListener('click', () => moveRail(1));
  rail.addEventListener('scroll', updateRail, { passive: true });
  rail.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const atStart = rail.scrollLeft <= 0;
    const atEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1;
    if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) return;
    event.preventDefault();
    rail.scrollLeft += event.deltaY;
  }, { passive: false });
  rail.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveRail(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); moveRail(1); }
  });
  rail.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') return;
    railDragging = true;
    railStartX = event.clientX;
    railStartScroll = rail.scrollLeft;
    rail.classList.add('dragging');
    rail.setPointerCapture(event.pointerId);
  });
  rail.addEventListener('pointermove', (event) => {
    if (railDragging) rail.scrollLeft = railStartScroll - (event.clientX - railStartX);
  });
  const stopRailDrag = () => {
    railDragging = false;
    rail.classList.remove('dragging');
  };
  rail.addEventListener('pointerup', stopRailDrag);
  rail.addEventListener('pointercancel', stopRailDrag);
  window.addEventListener('load', updateRail);

  const canvas = document.querySelector('#signal-field');
  const context = canvas.getContext('2d');
  const pointer = { x: -1000, y: -1000 };
  let particles = [];
  let frame = 0;

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(70, Math.floor(window.innerWidth / 22));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.2 + .35
    }));
  }

  function drawField() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
      if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
      const mouseDistance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
      context.fillStyle = mouseDistance < 180 ? 'rgba(108,246,255,.72)' : 'rgba(133,159,220,.3)';
      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fill();
      for (let j = index + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const distance = Math.hypot(other.x - particle.x, other.y - particle.y);
        if (distance < 95) {
          context.strokeStyle = `rgba(82,126,220,${(1 - distance / 95) * .11})`;
          context.lineWidth = .5;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
      if (mouseDistance < 180) {
        context.strokeStyle = `rgba(108,246,255,${(1 - mouseDistance / 180) * .18})`;
        context.beginPath();
        context.moveTo(pointer.x, pointer.y);
        context.lineTo(particle.x, particle.y);
        context.stroke();
      }
    });
    frame = requestAnimationFrame(drawField);
  }

  if (!reducedMotion) {
    resizeCanvas();
    drawField();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('pointermove', (event) => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else drawField();
    });
  }
})();
