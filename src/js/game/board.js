import Square from "./square.js";

export default class Board {
  constructor(boardId) {
    this.boardElement = document.getElementById(boardId);
    this.squares = [];
  }

  render() {
    this.boardElement.innerHTML = "";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const color = (r + c) % 2 === 0 ? "light" : "dark";
        const square = new Square(r, c, color);
        const div = document.createElement("div");
        div.classList.add("square", color);
        div.dataset.r = r;
        div.dataset.c = c;
        this.boardElement.appendChild(div);
        this.squares.push(square);
      }
    }
  }
}
