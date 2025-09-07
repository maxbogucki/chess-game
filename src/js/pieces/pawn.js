import Piece from "./piece.js";
import Move from "./moves.js";

export default class Pawn extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♙" : "♟";
  }

  getLegalMoves(board) {
    const moves = [];
    const { row, col } = this.square;
    const direction = this.color === "white" ? -1 : 1;

    // One square forward
    const oneForward = board.getSquare(row + direction, col);
    if (oneForward && !oneForward.isOccupied()) {
      moves.push(new Move(this.square, oneForward, this));

      // Two squares forward (first move only)
      const isFirstMove =
        (this.color === "white" && row === 6) ||
        (this.color === "black" && row === 1);
    }

    if (isFirstMove) {
      const twoForward = board.getSquare(row + 2 * direction, col);
      if (twoForward && !twoForward.isOccupied()) {
        moves.push(new Move(this.square, twoForward, this));
      }
    }

    // Diagonal capture
    const captureLeft = board.getSquare(row + direction, col - 1);
    const captureRight = board.getSquare(row + direction, col + 1);

    if (
      captureLeft &&
      captureLeft.isOccupied() &&
      captureLeft.piece.color !== this.color
    ) {
      moves.push(new Move(this.square, captureLeft, this, captureLeft.piece));
    }

    if (captureRight.isOccupied() && captureRight.piece.color !== this.color) {
      moves.push(new Move(this.square, captureRight, this, captureRight.piece));
    }

    return moves;
  }
}
