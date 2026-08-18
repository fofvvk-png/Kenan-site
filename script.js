// Socket.io Server Bağlantısı
// DİQQƏT: Server ünvanını öz server linkinlə əvəzlə (məsələn: https://senin-app.glitch.me)
const socket = io("http://localhost:3000"); 

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let myColor = '#38bdf8';
let myName = 'Oyunçu';
let roomId = null;
let isHost = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('carGameHighScore') || 0;
document.getElementById('highScore').innerText = highScore;

// Oyunçu Obyekti
const player = {
  x: 225,
  y: 230,
  width: 50,
  height: 70,
  speed: 6,
  moveLeft: false,
  moveRight: false
};

// Rəqib Obyekti
const opponent = {
  x: 225,
  y: 230,
  width: 50,
  height: 70,
  color: '#ef4444',
  name: 'Gözlənilir...'
};

// Maneələr və Xəttlər
let obstacles = [];
let roadLines = [];
let lineOffset = 0;

// Rəng Seçimi
function selectColor(element, color) {
  document.querySelectorAll('.color-opt').forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');
  myColor = color;
}

// Oyuna Başlamaq və Otağa Qoşulmaq
function startGameWithPlayer() {
  const inputName = document.getElementById('playerNameInput').value.trim();
  if (inputName) myName = inputName;

  document.getElementById('driverName').innerText = myName;
  document.getElementById('driverName').style.color = myColor;
  document.getElementById('statusText').innerText = "Otaq axtarılır...";

  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }

  canvas.width = 500;
  canvas.height = 320;

  socket.emit('joinGame', { name: myName, color: myColor });
}

// Socket Hadisələri
socket.on('waitingForOpponent', () => {
  document.getElementById('statusText').innerText = "Rəqib gözlənilir...";
});

socket.on('gameStart', (data) => {
  document.getElementById('startModal').style.display = 'none';
  roomId = data.roomId;
  isHost = data.isHost;

  const oppData = data.players.find(p => p.id !== socket.id);
  if (oppData) {
    opponent.name = oppData.name;
    opponent.color = oppData.color;
    document.getElementById('opponentName').innerText = opponent.name;
    document.getElementById('opponentName').style.color = opponent.color;
  }

  requestAnimationFrame(gameLoop);
});

socket.on('opponentMoved', (data) => {
  opponent.x = data.x;
});

socket.on('updateObstacles', (data) => {
  obstacles = data;
});

socket.on('opponentGameOver', () => {
  alert("Rəqib qəza etdi! Qazandınız! 🎉");
  gameOver = true;
});

// Klaviatura İdarəetməsi
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') player.moveLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd') player.moveRight = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') player.moveLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd') player.moveRight = false;
});

// Mobil Düymə İdarəetməsi
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); player.moveLeft = true; });
leftBtn.addEventListener('touchend', () => player.moveLeft = false);
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); player.moveRight = true; });
rightBtn.addEventListener('touchend', () => player.moveRight = false);

// Avtomobil Çəkmək
function drawCar(x, y, width, height, color, label) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  // Təkərlər
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 4, y + 8, 4, 15);
  ctx.fillRect(x + width, y + 8, 4, 15);
  ctx.fillRect(x - 4, y + height - 23, 4, 15);
  ctx.fillRect(x + width, y + height - 23, 4, 15);

  // Şüşələr
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x + 5, y + 15, width - 10, 12);

  // Adı göstərmək
  if (label) {
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + width / 2, y - 5);
  }
}

// Oyun Dövriyyəsi
function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Yol Xəttlərinin Hərəkəti
  lineOffset = (lineOffset + 5) % 40;
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = -lineOffset;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  // Oyunçunun Hərəkəti
  if (player.moveLeft && player.x > 10) player.x -= player.speed;
  if (player.moveRight && player.x < canvas.width - player.width - 10) player.x += player.speed;

  // Koordinatı Rəqibə Göndər
  socket.emit('playerMove', { roomId, x: player.x });

  // Host Maneələri İdarə Edir
  if (isHost) {
    if (Math.random() < 0.02) {
      const obsX = Math.random() * (canvas.width - 60) + 10;
      obstacles.push({ x: obsX, y: -70, width: 45, height: 65 });
    }

    for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].y += 4;
    }

    obstacles = obstacles.filter(obs => obs.y < canvas.height);
    socket.emit('syncObstacles', { roomId, obstacles });
  }

  // Maneələri Çək və Toqquşmanı Yoxla
  for (let obs of obstacles) {
    drawCar(obs.x, obs.y, obs.width, obs.height, '#94a3b8', null);

    // Qəza Yoxlaması
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver = true;
      alert("Qəza etdiniz! Oyun bitdi.");
      socket.emit('gameOver', { roomId });
      document.getElementById('restartBtn').style.display = 'block';
    }
  }

  // Maşınları Çək
  drawCar(player.x, player.y, player.width, player.height, myColor, myName);
  drawCar(opponent.x, opponent.y, opponent.width, opponent.height, opponent.color, opponent.name);

  // Xal Hesablanması
  score++;
  document.getElementById('score').innerText = Math.floor(score / 10);

  if (score / 10 > highScore) {
    highScore = Math.floor(score / 10);
    localStorage.setItem('carGameHighScore', highScore);
    document.getElementById('highScore').innerText = highScore;
  }

  requestAnimationFrame(gameLoop);
}

function restartGame() {
  location.reload();
}
function openFullscreen() {
  let elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari / Chrome mobile */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}
