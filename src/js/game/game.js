import Board from "./board.js";

export default class Game {
  constructor(boardId) {
    this.boardId = boardId;
    this.board = null;
  }

  init() {
    this.board = new Board(this.boardId);
    this.board.render();
    this.setupResetButton();
    console.log("Game initialized");
  }

  setupResetButton() {
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.board.resetGame();
      });
    }
  }
}
