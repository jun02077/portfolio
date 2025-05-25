const canvas = document.getElementById('tetrisClock');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const blockSize = 8;
const colors = ['#0ff', '#0f0', '#f0f', '#ff0', '#f00', '#00f'];

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  updateTimeBlocks();
});

class Block {
  constructor(x, y, targetY, color, alpha = 1) {
    this.x = x;
    this.y = y;
    this.targetY = targetY;
    this.color = color;
    this.alpha = alpha;
  }

  update() {
    if (this.y < this.targetY) {
      this.y += 4;
      if (this.y > this.targetY) this.y = this.targetY;
    }
  }

  fadeOut() {
    this.alpha -= 0.01;
    if (this.alpha < 0) this.alpha = 0;
  }

  draw(ctx) {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, blockSize, blockSize);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(this.x, this.y, blockSize, blockSize);
    ctx.globalAlpha = 1;
  }
}

let blocks = [];
let oldBlocks = [];
let lastMinute = null;

function getTimeString() {
  const now = new Date();
  return now.getHours().toString().padStart(2, '0') + ':' +
         now.getMinutes().toString().padStart(2, '0');
}

function createTimeBlocks(timeStr) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  const fontSize = 80;
  tempCanvas.width = width;
  tempCanvas.height = height;

  tempCtx.font = `bold ${fontSize}px monospace`;
  tempCtx.textAlign = 'right'; 
  tempCtx.textBaseline = 'bottom';
  tempCtx.fillStyle = '#fff';

  const textX = width - 100;      
  const textY = height - 100;     
  tempCtx.fillText(timeStr, textX, textY);

  const imageData = tempCtx.getImageData(0, 0, width, height).data;
  const newBlocks = [];

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      const index = ((y * width) + x) * 4;
      const alpha = imageData[index + 3];
      if (alpha > 128) {
        const startY = -Math.random() * height;
        const color = colors[Math.floor(Math.random() * colors.length)];
        newBlocks.push(new Block(x, startY, y, color));
      }
    }
  }

  return newBlocks;
}

function updateTimeBlocks() {
  const now = new Date();
  const currentMinute = now.getMinutes();

  if (currentMinute !== lastMinute) {
    lastMinute = currentMinute;
    oldBlocks = blocks.map(b => new Block(b.x, b.y, b.targetY, b.color, 1));
    blocks = createTimeBlocks(getTimeString());
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  oldBlocks.forEach(b => {
    b.fadeOut();
    b.draw(ctx);
  });
  oldBlocks = oldBlocks.filter(b => b.alpha > 0);

  blocks.forEach(b => {
    b.update();
    b.draw(ctx);
  });

  requestAnimationFrame(animate);
}

function startClock() {
  lastMinute = new Date().getMinutes();
  blocks = createTimeBlocks(getTimeString());
  setInterval(updateTimeBlocks, 1000);
}

startClock();
animate();
