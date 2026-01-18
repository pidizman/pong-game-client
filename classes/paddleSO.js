class PaddleSO extends PaddlePL {
  constructor(x, y, side, socket, room) {
    super(x, y, side, socket, room);
  }

  update() {
    // Tato pálka se neovládá klávesnicí.
    // Čeká na zprávu "paddleMove" ze serveru a aktualizuje svou polohu podle soupeře.
    this.socket.on("paddleMove", (data) => {
      // Kontrola, zda data patří do této místnosti a k této straně
      if (data.room === this.room && data.side === this.side) {
        this.y = data.y;
      }
    });
  }

  show() {
    // Vykreslení soupeřovy pálky
    rect(this.x, this.y, this.w, this.h);
  }
}