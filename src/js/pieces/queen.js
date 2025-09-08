import Piece from "./piece.js";
import { getStraightMoves, getDiagonalMoves } from "../helpers/moveHelpers.js";

export default class Queen extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♕" : "♛";
  }

  getPseudoLegalMoves(board) {
    return [
      ...getStraightMoves.call(this, board),
      ...getDiagonalMoves.call(this, board),
    ];
  }
}
