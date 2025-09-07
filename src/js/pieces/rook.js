import Piece from "./piece.js";
import { getVerticalMoves, getHorizontalMoves } from "../utils/moveHelpers.js";

export default class Rook extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♖" : "♜";
  }

  getLegalMoves(board) {
    return [...getVerticalMoves.call(this, board), ...getHorizontalMoves.call(this, board)];
  }
}
