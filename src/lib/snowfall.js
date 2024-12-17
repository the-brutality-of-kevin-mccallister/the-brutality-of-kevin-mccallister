// @ts-nocheck
export function initializeSnowEffect(container) {
  const COUNT = 300;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let width = container.clientWidth;
  let height = container.clientHeight;
  let active = false;

  class Snowflake {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.vy = 1 + Math.random() * 3;
      this.vx = 0.5 - Math.random();
      this.r = 1 + Math.random() * 2;
      this.o = 0.5 + Math.random() * 0.5;
    }
  }

  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    active = width > 600;
    if (active) requestAnimationFrame(update);
  }

  function update() {
    ctx.clearRect(0, 0, width, height);
    if (!active) return;

    snowflakes.forEach((flake) => {
      flake.y += flake.vy;
      flake.x += flake.vx;
      ctx.globalAlpha = flake.o;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      if (flake.y > height) flake.reset();
    });

    requestAnimationFrame(update);
  }

  const snowflakes = Array.from({ length: COUNT }, () => new Snowflake());
  canvas.style.position = 'absolute';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.pointerEvents = 'none';

  container.style.position = 'relative';
  container.appendChild(canvas);

  onResize();
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    container.removeChild(canvas);
  };
}