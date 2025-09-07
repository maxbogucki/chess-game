import Piece from "./piece.js";

export default class Pawn extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♙" : "♟";
  }
}
