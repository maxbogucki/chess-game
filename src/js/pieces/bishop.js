import Piece from "./piece.js";
import { getDiagonalMoves } from "../utils/moveHelpers.js";

export default class Bishop extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♗" : "♝";
  }

  getLegalMoves(board) {
    return getDiagonalMoves.call(this, board);
  }
}
