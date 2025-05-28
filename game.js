const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const gameOverElement = document.getElementById('gameOver');

const shootSound = document.getElementById('shootSound');
const bgMusic = document.getElementById('bgMusic');




const zombieImage = new Image();
const zombieImage2 = new Image();
zombieImage.src = 'images/zombie.gif';
zombieImage2.src = 'images/zombie2.png';


// Start background music
//bgMusic.volume = 1.0;
//bgMusic.play();

function music(){
    bgMusic.volume = 1.0;
    bgMusic.play();
    document.getElementById("wlacz").style.display = "none";
    document.getElementById("wylacz").style.display = "";
}

function nomusic(){
    bgMusic.pause();
    document.getElementById("wylacz").style.display = "none";
    document.getElementById("wlacz").style.display = "";
}

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 20,
  speed: 3,
  angle: 0,
  health: 100
};

let score = 0;
let bullets = [];
let zombies = [];
let zombies2 = [];
let keys = {};
let mouse = { x: 0, y: 0 };
let gameRunning = true;

// Obsługa klawiatury
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Obsługa myszy
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
  if (!gameRunning) return;
  shootSound.currentTime = 0;
  shootSound.volume = 0.3;
  shootSound.play();
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  bullets.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angle) * 6,
    dy: Math.sin(angle) * 6,
    size: 5
  });
});

// Restart gry
function restartGame() {
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.health = 100;
  bullets = [];
  zombies = [];
  zombies2 = [];
  score = 0;
  gameRunning = true;
  gameOverElement.classList.add('hidden');
  //bgMusic.currentTime = 0;
  //bgMusic.play();
  requestAnimationFrame(gameLoop);
}

// Rysowanie gracza
function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  ctx.rotate(angle);
  ctx.fillStyle = 'lightgreen';
  ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
  ctx.restore();
}

// Rysowanie zombie
function drawZombies() {
    

  const zombieWidth = 60;
  const zombieHeight = 60;

  zombies.forEach(z => {
    ctx.drawImage(zombieImage, z.x - zombieWidth / 2, z.y - zombieHeight / 2, zombieWidth, zombieHeight);
  });
  zombies2.forEach(z => {
    ctx.drawImage(zombieImage2, z.x - zombieWidth / 2, z.y - zombieHeight / 2, zombieWidth, zombieHeight);
  });
}

// Rysowanie pocisków
function drawBullets() {
  ctx.fillStyle = 'yellow';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Ruch gracza
function movePlayer() {
  if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
  if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
  if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
  if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

  // Ograniczenia do granic canvasu
  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));
}

// Ruch zombie
function updateZombies() {
  zombies.forEach(z => {
    const angle = Math.atan2(player.y - z.y, player.x - z.x);
    z.x += Math.cos(angle) * z.speed;
    z.y += Math.sin(angle) * z.speed;

    // Sprawdzenie kolizji z graczem
    const dist = Math.hypot(player.x - z.x, player.y - z.y);
    if (dist < z.size + player.size / 2) {
      player.health -= 0.5;
      if (player.health <= 0) endGame();
    }
  });
  zombies2.forEach(z => {
    const angle = Math.atan2(player.y - z.y, player.x - z.x);
    z.x += Math.cos(angle) * z.speed;
    z.y += Math.sin(angle) * z.speed;

    // Sprawdzenie kolizji z graczem
    const dist = Math.hypot(player.x - z.x, player.y - z.y);
    if (dist < z.size + player.size / 2) {
      player.health -= 0.5;
      if (player.health <= 0) endGame();
    }
  });
}

// Ruch pocisków + kolizje
function updateBullets() {
  bullets.forEach((b, bi) => {
    b.x += b.dx;
    b.y += b.dy;

    zombies.forEach((z, zi) => {
      const dist = Math.hypot(b.x - z.x, b.y - z.y);
      if (dist < b.size + z.size) {
        zombies.splice(zi, 1);
        bullets.splice(bi, 1);
        score++;
      }
    });
    zombies2.forEach((z, zi) => {
      const dist = Math.hypot(b.x - z.x, b.y - z.y);
      if (dist < b.size + z.size) {
        zombies2.splice(zi, 1);
        bullets.splice(bi, 1);
        score++;
      }
    });
  });

  // Usuwanie pocisków poza ekranem
  bullets = bullets.filter(b =>
    b.x > 0 && b.x < canvas.width && b.y > 0 && b.y < canvas.height
  );
}

// Tworzenie zombie
function spawnZombie() {
  if (!gameRunning) return;
  const size = 20;
  let x, y;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: // lewa
      x = 0;
      y = Math.random() * canvas.height;
      break;
    case 1: // prawa
      x = canvas.width;
      y = Math.random() * canvas.height;
      break;
    case 2: // góra
      x = Math.random() * canvas.width;
      y = 0;
      break;
    case 3: // dół
      x = Math.random() * canvas.width;
      y = canvas.height;
      break;
  }
  
  zombies.push({
    x,
    y,
    size,
    speed: 1 + Math.random() * 0.5
  });

}

function spawnZombie2() {
  if (!gameRunning) return;
  const size = 20;
  let x, y;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: // lewa
      x = 0;
      y = Math.random() * canvas.height;
      break;
    case 1: // prawa
      x = canvas.width;
      y = Math.random() * canvas.height;
      break;
    case 2: // góra
      x = Math.random() * canvas.width;
      y = 0;
      break;
    case 3: // dół
      x = Math.random() * canvas.width;
      y = canvas.height;
      break;
  }
  let poziom = score / 10;

  if(score > 10){
  zombies2.push({
    x,
    y,
    size,
    speed: 1 + Math.random() * 0.5 + poziom
  });
  }
}


setInterval(spawnZombie, 1000);

setInterval(spawnZombie2, 1000);



function endGame() {
  gameRunning = false;
  gameOverElement.classList.remove('hidden');
  //bgMusic.pause();
}

// Pętla gry
function gameLoop() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer();
  updateZombies();
  updateBullets();

  drawPlayer();
  drawZombies();
  drawBullets();

  scoreElement.textContent = `Zabici: ${score}`;
  healthElement.textContent = `Życie: ${Math.max(0, Math.floor(player.health))}`;

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
