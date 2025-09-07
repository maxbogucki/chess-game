import Piece from "./piece.js";
import Move from "../game/move.js";

export default class Knight extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♘" : "♞";
  }

  getLegalMoves(board) {
    const moves = [];
    const { row, col } = this.square;

    // All possible knight moves (L-shapes: 2+1 in any direction)
    const knightMoves = [
      [-2, -1], // Up 2, left 1
      [-2, 1], // Up 2, right 1
      [-1, -2], // Up 1, left 2
      [-1, 2], // Up 1, right 2
      [1, -2], // Down 1, left 2
      [1, 2], // Down 1, right 2
      [2, -1], // Down 2, left 1
      [2, 1], // Down 2, right 1
    ];

    for (const [rowDelta, colDelta] of knightMoves) {
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
