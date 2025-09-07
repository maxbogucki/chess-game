import Piece from "./piece.js";
import Move from "../game/move.js";

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

      if (isFirstMove) {
        const twoForward = board.getSquare(row + 2 * direction, col);
        if (twoForward && !twoForward.isOccupied()) {
          const move = new Move(this.square, twoForward, this);
          move.isDoublePawnPush = true; // Mark this move
          moves.push(move);
        }
      }
    }

    // Captures
    const captureLeft = board.getSquare(row + direction, col - 1);
    const captureRight = board.getSquare(row + direction, col + 1);

    if (
      captureLeft &&
      captureLeft.isOccupied() &&
      captureLeft.piece.color !== this.color
    ) {
      moves.push(new Move(this.square, captureLeft, this, captureLeft.piece));
    }

    if (
      captureRight &&
      captureRight.isOccupied() &&
      captureRight.piece.color !== this.color
    ) {
      moves.push(new Move(this.square, captureRight, this, captureRight.piece));
    }

    // en passant
    const last = board.lastMove;
    if (
      last &&
      last.piece &&
      last.piece.constructor.name === "Pawn" &&
      last.isDoublePawnPush
    ) {
      // Check if the last move pawn is adjacent horizontally
      if (Math.abs(last.toSquare.col - col) === 1) {
        // For white pawn, we must be on row 3 (index 3), for black row 4 (index 4)
        const correctRow = this.color === "white" ? 3 : 4;
        if (row === correctRow) {
          const captureTarget = board.getSquare(
            row + direction,
            last.toSquare.col
          );
          const epMove = new Move(this.square, captureTarget, this, last.piece);
          epMove.isEnPassant = true;
          moves.push(epMove);
        }
      }
    }

    return moves;
  }
}
