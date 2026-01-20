let leftPaddle;
let rightPaddle;
let ball;

let leftScore = 0;
let rightScore = 0;
const maxScore = 5; // Hra končí, když někdo dosáhne 5 bodů

let gameStarted = false;
let gameOver = false;
let winner = "";

function setup() {
  // Dotaz na jméno při načtení stránky
  const name = prompt("Zadej své jméno:", "Hráč") || "Hráč";
  localStorage.setItem("playerName", name);

  createCanvas(800, 500);

  // Připojení k Node.js serveru a odeslání jména v query
  const socket = io("https://pong-game-server-production-89ae.up.railway.app", { query: { name } });

  socket.on("connect_error", () => {
    alert("Server neběží");
  });
  
  // Čekání na signál od serveru, že byl nalezen soupeř
  socket.on("start", ({ opponentName, room, side, isHost}) => {
      localStorage.setItem("side", side);
      localStorage.setItem("opponentName", opponentName);

      // Podle přidělené strany vytvoříme pálky (jedna ovládaná námi, jedna ze socketu)
      if (side === "left") {
        leftPaddle = new PaddlePL(20, height / 2 - 50, 'left', socket, room);
        rightPaddle = new PaddleSO(width - 30, height / 2 - 50, 'right', socket, room);
      } else {
        rightPaddle = new PaddlePL(width - 30, height / 2 - 50, 'right', socket, room);
        leftPaddle = new PaddleSO(20, height / 2 - 50, 'left', socket, room);
      }

      ball = new Ball(socket, room, isHost);
      gameStarted = true;
  });

  // Přijímání polohy míčku od hostitele (pro ne-hostitele)
  socket.on("ballMove", (data) => {
    if (ball && data.room === ball.room) {
      ball.x = data.x;
      ball.y = data.y;
      leftScore = data.leftScore;
      rightScore = data.rightScore;
    }
  });
}

function draw() {
  background(20);

  if (!gameStarted) {
    // Úvodní obrazovka čekání
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Čekání na soupeře...", width / 2, height / 2);
    return;
  } else {
    drawCenterLine();
    drawScore();
    drawNames();

    if (gameOver) {
      drawGameOverScreen();
      noLoop(); // Zastavení herní smyčky
      return;
    }

    // Aktualizace obou pálek
    leftPaddle.update();
    rightPaddle.update();
    
    // Vykreslení pálek
    leftPaddle.show();
    rightPaddle.show();

    // Logika míčku (pohyb a emise dat u hostitele)
    const scoreUpdate = ball.update(leftScore, rightScore);
    if (scoreUpdate) {
      leftScore = scoreUpdate.leftScore;
      rightScore = scoreUpdate.rightScore;
    }
    
    ball.show();

    // Detekce kolizí s pálkami
    ball.checkCollision(leftPaddle);
    ball.checkCollision(rightPaddle);

    // Kontrola vítězství
    if (leftScore >= maxScore) endGame(localStorage.getItem("side") === "left" ? localStorage.getItem("playerName") : localStorage.getItem("opponentName"));
    if (rightScore >= maxScore) endGame(localStorage.getItem("side") === "right" ? localStorage.getItem("playerName") : localStorage.getItem("opponentName"));
  }
}

// Pomocná funkce pro vykreslení přerušované čáry uprostřed
function drawCenterLine() {
  stroke(255);
  strokeWeight(3);
  for (let y = 0; y < height; y += 20) {
    line(width / 2, y, width / 2, y + 10);
  }
}

// Vykreslení aktuálního stavu skóre
function drawScore() {
  textAlign(CENTER);
  textSize(32);
  fill(255);
  noStroke();
  text(leftScore, width / 2 - 50, 40);
  text(rightScore, width / 2 + 50, 40);
}

// Vykreslí jména obou hráčů do horních rohů.
function drawNames() {
  // Načtení uložených dat z prohlížeče (uloženo při startu v sketch.js)
  const playerName = localStorage.getItem("playerName");
  const opponentName = localStorage.getItem("opponentName");
  
  // Zjištění, zda tento konkrétní klient hraje za levou stranu
  const isLeft = localStorage.getItem("side") === "left";

  // Logika pro správné umístění jmen:
  // Pokud jsem "left", moje jméno jde doleva. Pokud ne, patří tam jméno soupeře.
  const leftName = isLeft ? playerName : opponentName;
  const rightName = isLeft ? opponentName : playerName;

  // Nastavení barvy textu
  fill(255);

  // Vykreslení jména vlevo (zarovnáno k levému okraji)
  textAlign(LEFT);
  text(leftName, 20, 40);

  // Vykreslení jména vpravo (zarovnáno k pravému okraji plátna)
  textAlign(RIGHT);
  text(rightName, width - 20, 40);
}

// Funkce pro ukončení hry
function endGame(playerName) {
  gameOver = true;
  winner = playerName;
}

// Obrazovka s vítězem
function drawGameOverScreen() {
  fill(0, 150);
  rect(0, 0, width, height);
  textAlign(CENTER);
  fill(255);
  textSize(48);
  text(`Vyhrává ${winner}!`, width / 2, height / 2 - 20);
}
