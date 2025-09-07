import Move from "../game/move.js";

// Combined optimized function for both vertical and horizontal moves
export function getStraightMoves(board) {
  const moves = [];
  const { row, col } = this.square;

  // Define all 4 straight directions: [rowDelta, colDelta]
  const directions = [
    [-1, 0], // Up
    [1, 0], // Down
    [0, -1], // Left
    [0, 1], // Right
  ];

  // Check each straight direction
  for (const [rowDelta, colDelta] of directions) {
    let currentRow = row + rowDelta;
    let currentCol = col + colDelta;

    // Continue in this direction until we hit a piece or board edge
    while (
      currentRow >= 0 &&
      currentRow < 8 &&
      currentCol >= 0 &&
      currentCol < 8
    ) {
      const targetSquare = board.getSquare(currentRow, currentCol);

      if (targetSquare.isOccupied()) {
        // If occupied by enemy piece, add capture move then stop
        if (targetSquare.piece.color !== this.color) {
          moves.push(
            new Move(this.square, targetSquare, this, targetSquare.piece)
          );
        }
        break; // Stop searching in this direction (hit a piece)
      }

      // If empty square, add regular move and continue
      moves.push(new Move(this.square, targetSquare, this));

      // Move to next square in this direction
      currentRow += rowDelta;
      currentCol += colDelta;
    }
  }

  return moves;
}

export function getDiagonalMoves(board) {
  const moves = [];
  const { row, col } = this.square;

  // Define all 4 diagonal directions: [rowDelta, colDelta]
  const directions = [
    [-1, -1], // up-left
    [-1, 1], // up-right
    [1, -1], // down-left
    [1, 1], // down-right
  ];

  // Check each diagonal direction
  for (const [rowDelta, colDelta] of directions) {
    let currentRow = row + rowDelta;
    let currentCol = col + colDelta;

    // Continue in this direction until we hit a piece or board edge
    while (
      currentRow >= 0 &&
      currentRow < 8 &&
      currentCol >= 0 &&
      currentCol < 8
    ) {
      const targetSquare = board.getSquare(currentRow, currentCol);

      if (targetSquare.isOccupied()) {
        if (targetSquare.piece.color !== this.color) {
          moves.push(
            new Move(this.square, targetSquare, this, targetSquare.piece)
          );
        }
        break; // Stop searching in this direction (hit a piece)
      }

      // If empty square, add regular move and continue
      moves.push(new Move(this.square, targetSquare, this));

      // Move to next square in this direction;
      currentRow += rowDelta;
      currentCol += colDelta;
    }
  }

  return moves;
}
