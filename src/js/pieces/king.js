import Piece from "./piece.js";
import Move from "../game/move.js";

export default class King extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♔" : "♚";
  }

  getLegalMoves(board) {
    const moves = [];
    const { row, col } = this.square;

    // All possible king moves (one square in any direction)
    const kingMoves = [
      [-1, -1], // Up-left
      [-1, 0], // Up
      [-1, 1], // Up-right
      [0, -1], // Left
      [0, 1], // Right
      [1, -1], // Down-left
      [1, 0], // Down
      [1, 1], // Down-right
    ];

    for (const [rowDelta, colDelta] of kingMoves) {
      const newRow = row + rowDelta;
      const newCol = col + colDelta;

      // Check if move is within board bounds
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetSquare = board.getSquare(newRow, newCol);

        // If square is empty or contains enemy piece
        if (
          !targetSquare.isOccupied() ||
          targetSquare.piece.color !== this.color
        ) {
          const capturedPiece = targetSquare.isOccupied()
            ? targetSquare.piece
            : null;
          moves.push(new Move(this.square, targetSquare, this, capturedPiece));
        }
      }
    }

    return moves;
  }
}
