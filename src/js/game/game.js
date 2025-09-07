import Board from "./board.js";

export default class Game {
  constructor(boardId) {
    this.boardId = boardId;
    this.board = null;
  }

  init() {
    this.board = new Board(this.boardId);
    this.board.render();
    console.log("Game initialized");
  }
}
