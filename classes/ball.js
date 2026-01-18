class Ball {
  constructor(socket, room, isHost) {
    this.r = 12;
    this.socket = socket;
    this.room = room;
    this.isHost = isHost; // Určuje, zda tento klient počítá fyziku míčku
    this.reset();
  }

  reset() {
    // Vrácení míčku doprostřed obrazovky
    this.x = width / 2;
    this.y = height / 2;

    // Náhodný směr po restartu
    this.vx = random([-5, 5]);
    this.vy = random(-3, 3);
  }

  update(leftScore, rightScore) {
    // Pouze hostitel (první připojený) počítá pohyb míčku, aby nedocházelo k desynchronizaci
    if (this.isHost) {
      this.x += this.vx;
      this.y += this.vy;

      // Odraz od horní a dolní stěny
      if (this.y <= 0 || this.y >= height) {
        this.vy *= -1;
      }

      let scoreChanged = false;
      
      // Detekce gólu na levé straně (bod pro pravého hráče)
      if(this.x < 0) {
        rightScore++;
        this.reset();
        scoreChanged = true;
      }

      // Detekce gólu na pravé straně (bod pro levého hráče)
      if(this.x > width) {
        leftScore++;
        this.reset();
        scoreChanged = true;
      }

      // Odeslání aktuální polohy míčku a skóre všem v místnosti
      this.socket.emit("ballMove", {
        room: this.room,
        x: this.x,
        y: this.y,
        leftScore: leftScore,
        rightScore: rightScore
      });

      // Pokud padl gól, vrátíme nové skóre pro aktualizaci v hlavním cyklu
      if(scoreChanged) {
        return { leftScore, rightScore };
      }
    }
    return null;
  }

  checkCollision(paddle) {
    // Kolize počítá opět pouze hostitel
    if (this.isHost) {
      if (collideRectCircle(paddle.x, paddle.y, paddle.w, paddle.h, this.x, this.y, this.r*2)) {
        this.vx *= -1; // Odraz od pálky
      }
    }
  }

  show() {
    circle(this.x, this.y, this.r * 2);
  }
}