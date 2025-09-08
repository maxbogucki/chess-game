import Piece from "./piece.js";
import { getDiagonalMoves } from "../helpers/moveHelpers.js";

export default class Bishop extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♗" : "♝";
  }

  getPseudoLegalMoves(board) {
    return getDiagonalMoves.call(this, board);
  }
}
