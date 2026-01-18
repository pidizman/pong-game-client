class PaddlePL {
  constructor(x, y, side, socket, room) {
    this.x = x;
    this.y = y;
    this.w = 12;
    this.h = 100;
    this.speed = 6;
    this.side = side;   // 'left' nebo 'right'
    this.socket = socket;
    this.room = room;
  }

  update() {
    // Ovládání šipkami – mění vertikální pozici Y
    if (keyIsDown(UP_ARROW)) this.y -= this.speed;
    if (keyIsDown(DOWN_ARROW)) this.y += this.speed;

    // Omezení, aby pálka nevyjela z horního nebo dolního okraje plátna
    this.y = constrain(this.y, 0, height - this.h);

    // Odeslání nové polohy na server, aby ji viděl i soupeř
    this.socket.emit("paddleMove", {
      room: this.room,
      side: this.side,
      y: this.y
    });
  }

  show() {
    rect(this.x, this.y, this.w, this.h);
  }
}