import Piece from "./piece.js";
import { getStraightMoves } from "../helpers/moveHelpers.js";

export default class Rook extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♖" : "♜";
  }

  getPseudoLegalMoves(board) {
    return getStraightMoves.call(this, board);
  }
}
