import Piece from "./piece.js";
import {
  getVerticalMoves,
  getHorizontalMoves,
  getDiagonalMoves,
} from "../utils/moveHelpers.js";

export default class Queen extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♕" : "♛";
  }

  getLegalMoves(board) {
    return [
      ...getVerticalMoves.call(this, board),
      ...getHorizontalMoves.call(this, board),
      ...getDiagonalMoves.call(this, board),
    ];
  }
}
