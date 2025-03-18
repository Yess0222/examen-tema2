const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Botón de reinicio
const restartButton = document.getElementById("restartButton");

// Cambiar el cursor del mouse en el canvas
canvas.style.cursor = "url('images/cursor.cur'), auto"; // Cambia la ruta por la ubicación real de tu imagen

// Imágenes
const background = new Image();
background.src = "images/background.jpg";

const fishImg = new Image();
fishImg.src = "images/fish.png";

const obstacleImg = new Image();
obstacleImg.src = "images/obstacle.png";

const fishermanImg = new Image();
fishermanImg.src = "images/fisherman.png"; // Imagen del pescador

// Variables del juego
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; // Recuperar la puntuación más alta
let level = 1; // Nivel inicial
let fishes = [];
let obstacles = [];
let gameOver = false;
let fishingLine = null; // Coordenadas de la línea de pesca

// Dibujar fondo y pescador
function drawFishermanAndBackground() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Dibujar pescador en el centro del canvas
  const fishermanWidth = 450;
  const fishermanHeight = 300;
  const fishermanX = canvas.width / 2 - fishermanWidth / 2;
  const fishermanY = canvas.height / 2 - fishermanHeight / 2;
  ctx.drawImage(fishermanImg, fishermanX, fishermanY, fishermanWidth, fishermanHeight);
}

// Dibujar línea de pesca
function drawFishingLine() {
  if (fishingLine) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2); // Línea desde el centro del canvas
    ctx.lineTo(fishingLine.x, fishingLine.y); // Termina en las coordenadas clicadas
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Dibujar puntuación y nivel
function drawScoreAndLevel() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "start";

  // Mostrar puntuación
  ctx.fillText(`Puntuación: ${score}`, 20, 40);

  // Mostrar nivel
  ctx.fillText(`Nivel: ${level}`, 20, 80);
}

// Generar peces y obstáculos
function generateFishOrObstacle(image, isObstacle) {
  return {
    x: Math.random() * (canvas.width - 50),
    y: isObstacle ? 0 : canvas.height,
    speed: 2 + Math.random() * level, // La velocidad aumenta con el nivel
    image: image,
    isObstacle: isObstacle,
  };
}

// Dibujar peces y obstáculos
function drawObjects(objects) {
  objects.forEach((obj, index) => {
    ctx.drawImage(obj.image, obj.x, obj.y, 50, 50);

    // Movimiento
    obj.y += obj.isObstacle ? obj.speed : -obj.speed;

    // Eliminar objetos fuera del canvas
    if (obj.y > canvas.height || obj.y < 0) {
      objects.splice(index, 1);
    }
  });
}

// Dibujar todo
function draw() {
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "20px Arial";
    ctx.fillText(`Puntuación final: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

    // Mostrar botón de reinicio
    restartButton.style.display = "block";
    return;
  }

  drawFishermanAndBackground(); // Dibujar fondo y pescador
  drawFishingLine(); // Dibujar línea de pesca
  drawScoreAndLevel(); // Dibujar puntuación y nivel
  drawObjects(fishes); // Dibujar peces
  drawObjects(obstacles); // Dibujar obstáculos

  requestAnimationFrame(draw);
}

// Actualizar objetos y dificultad
function updateGameObjects() {
  if (gameOver) return;

  // Generar peces si faltan
  while (fishes.length < 5) {
    fishes.push(generateFishOrObstacle(fishImg, false));
  }

  // Generar obstáculos si faltan
  while (obstacles.length < 3) {
    obstacles.push(generateFishOrObstacle(obstacleImg, true));
  }

  // Incrementar nivel de dificultad según la puntuación
  if (score >= level * 20) { // Subir de nivel cada 20 puntos
    level++;
  }
}

// Detectar clic en el canvas
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Configurar línea de pesca
  fishingLine = { x: mouseX, y: mouseY };

  // Verificar si se clicó un pez
  fishes = fishes.filter((fish) => {
    const caught = mouseX > fish.x && mouseX < fish.x + 50 && mouseY > fish.y && mouseY < fish.y + 50;
    if (caught) score += 10;
    return !caught;
  });

  // Verificar si se clicó un obstáculo
  obstacles.forEach((obstacle) => {
    const hit = mouseX > obstacle.x && mouseX < obstacle.x + 50 && mouseY > obstacle.y && mouseY < obstacle.y + 50;
    if (hit) {
      gameOver = true;
      saveHighScore();
    }
  });

  // Eliminar la línea después de 500 ms
  setTimeout(() => (fishingLine = null), 500);
});

// Guardar puntuación más alta
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").textContent = `Mejor Puntuación: ${highScore}`;
  }
}

// Reiniciar juego
function restartGame() {
  score = 0;
  level = 1;
  gameOver = false;
  fishes = [];
  obstacles = [];
  restartButton.style.display = "none"; // Ocultar botón
  draw(); // Reiniciar el bucle de dibujo
}

// Evento para reiniciar juego
restartButton.addEventListener("click", restartGame);

// Iniciar juego
function init() {
  setInterval(updateGameObjects, 1000); // Generar peces y obstáculos
  draw(); // Comenzar el bucle de dibujo
}

init();
