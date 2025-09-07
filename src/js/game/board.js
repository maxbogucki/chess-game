import Square from "./square.js";
import Pawn from "../pieces/pawn.js";
import Rook from "../pieces/rook.js";
import Knight from "../pieces/knight.js";
import Bishop from "../pieces/bishop.js";
import Queen from "../pieces/queen.js";
import King from "../pieces/king.js";

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
        square.element = div;
        this.boardElement.appendChild(div);
        this.squares.push(square);
      }
    }

    this.setupPieces();
    this.updateUI();
  }

  setupPieces() {
    const backRank = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];

    for (let c = 0; c < 8; c++) {
      // Black pieces
      this.placePiece(new backRank[c](this.getSquare(0, c), "black"));
      this.placePiece(new Pawn(this.getSquare(1, c), "black"));

      // White pieces
      this.placePiece(new backRank[c](this.getSquare(7, c), "white"));
      this.placePiece(new Pawn(this.getSquare(6, c), "white"));
    }
  }

  placePiece(piece) {
    piece.square.setPiece(piece);
  }

  getSquare(row, col) {
    return this.squares[row * 8 + col];
  }

  updateUI() {
    this.squares.forEach((square) => {
      if(square.piece) {
        square.element.textContent = square.piece.getSymbol();
        square.element.classList.add(square.piece.color); // Add classes white/black
      } else {
        square.element.textContent = "";
        square.element.classList.remove("white", "black"); // Remove old classes
      }
    });
  }
}
