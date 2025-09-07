import Piece from "./piece.js";
import { getStraightMoves } from "../utils/moveHelpers.js";

export default class Rook extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♖" : "♜";
  }

  getLegalMoves(board) {
    return getStraightMoves.call(this, board);
  }
}
