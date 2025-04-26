const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const coinSound = new Audio('colision1.mp3');
coinSound.preload = 'auto';
const soundPool = [];
for (let i = 0; i < 5; i++) {
    const sound = new Audio('colision1.mp3');
    sound.preload = 'auto';
    soundPool.push(sound);
}
const backgroundMusic = new Audio('fondito.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2; // Volumen bajito

let currentSound = 0;

let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

const playerImage = new Image();
playerImage.src = 'yoongi.png';

const coinImage = new Image();
coinImage.src = 'naranja.png';

const player = { x: 50, y: 50, w: 53, h: 65, speed: 3 };

const levels = [
  {
    obstacles: [
      { x: 100, y: 150, w: 400, h: 20 },
      { x: 300, y: 250, w: 20, h: 100 }
    ],
    coins: [
      { x: 500, y: 50, collected: false },
      { x: 50, y: 300, collected: false }
    ]
  },
  {
    obstacles: [
      { x: 200, y: 100, w: 200, h: 20 },
      { x: 200, y: 200, w: 20, h: 100 },
      { x: 400, y: 200, w: 20, h: 100 }
    ],
    coins: [
      { x: 50, y: 50, collected: false },
      { x: 550, y: 350, collected: false },
      { x: 300, y: 180, collected: false }
    ]
  },
  {
    obstacles: [
        { x: 100, y: 50, w: 150, h: 10 },
        { x: 300, y: 100, w: 200, h: 10 },
        { x: 150, y: 200, w: 10, h: 150 },
        { x: 400, y: 250, w: 10, h: 100 },
        { x: 250, y: 350, w: 200, h: 10 }
      ],
    coins: [
      { x: 50, y: 100, collected: false },
      { x: 150, y: 150, collected: false },
      { x: 250, y: 50, collected: false },
      { x: 350, y: 150, collected: false },
      { x: 450, y: 50, collected: false },
      { x: 550, y: 150, collected: false },
      { x: 150, y: 350, collected: false },
      { x: 450, y: 350, collected: false },
      { x: 300, y: 250, collected: false }
    ]
  }
];

let currentLevel = 0;

function rectsCollide(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

function drawrect(obj) {
    ctx.fillStyle = obj.color || '#a9a9a9'; // gris oscuro
    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
}


function update() {
    const level = levels[currentLevel];

    if (keys['ArrowUp']) player.y -= player.speed;
    if (keys['ArrowDown']) player.y += player.speed;
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
    if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;

    for (let obs of level.obstacles) {
        if (rectsCollide(player, obs)) {
            if (keys['ArrowUp']) player.y += player.speed;
            if (keys['ArrowDown']) player.y -= player.speed;
            if (keys['ArrowLeft']) player.x += player.speed;
            if (keys['ArrowRight']) player.x -= player.speed;
        }
    }

    for (let coin of level.coins) {
        if (!coin.collected) {
            if (
                player.x < coin.x + 25 &&
                player.x + player.w > coin.x &&
                player.y < coin.y + 25 &&
                player.y + player.h > coin.y
            ) {
                coin.collected = true;
                try {
                    soundPool[currentSound].currentTime = 0;
                    soundPool[currentSound].play();
                    currentSound = (currentSound + 1) % soundPool.length;
                } catch (e) {
                    console.log("Error reproduciendo sonido:", e);
                }
            }
        }
    }

    const allCollected = level.coins.every(c => c.collected);
    if (allCollected) {
        if (currentLevel < levels.length - 1) {
            currentLevel++;
            resetLevel();
        } else {
            alert("¡Felicitaciones, Nikolle Acuña!");
            currentLevel = 0;
            resetLevel();
        }
    }
}

function resetLevel() {
    player.x = 50;
    player.y = 50;

    levels[currentLevel].coins.forEach(coin => {
        coin.collected = false;

    });
}

function draw() {
    ctx.fillStyle = '#f5f5dc'; // fondo beige
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(playerImage, player.x, player.y, player.w, player.h);

    const level = levels[currentLevel];

    for (let obs of level.obstacles) {
        drawrect({ ...obs, color: '#a9a9a9' }); // obstáculos gris oscuro
    }

    for (let coin of level.coins) {
        if (!coin.collected) {
            ctx.drawImage(coinImage, coin.x, coin.y, 45, 40);
        }
    }

    // Texto centrado
    ctx.font = '20px "Comic Sans MS", cursive, sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center'; // Centramos el texto

    const centerX = canvas.width / 2;
    ctx.fillText(`Nivel: ${currentLevel + 1}   |   Monedas: ${level.coins.filter(c => c.collected).length}/${level.coins.length}`, centerX, 30);

    ctx.textAlign = 'left'; // Restablecer alineación para otros textos

    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Nikolle Acuña', canvas.width - 120, canvas.height - 10);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    const unlockAudio = () => {
        const silentSound = new Audio();
        silentSound.play().catch(() => { });
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        backgroundMusic.play().catch(() => {});

        resetLevel();
        gameLoop();
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    ctx.fillStyle = '#f5f5dc'; // fondo beige
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🍊 Bienvenido, Nikolle Acuña 🍊', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText('¡Ayuda a Yoongi a recolectar sus mandarinas!', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText('Haz clic o presiona cualquier tecla para comenzar', canvas.width / 2, canvas.height / 2 + 20);
    ctx.textAlign = 'left';
}

startGame();
