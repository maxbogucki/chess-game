import Move from "../game/move.js";

export function getVerticalMoves(board) {
  const moves = [];
  const { row, col } = this.square;

  // Up
  for (let r = row - 1; r >= 0; r--) {
    const targetSquare = board.getSquare(r, col);

    if (targetSquare.isOccupied()) {
      // If occupied by enemy piece, add capture move
      if (targetSquare.piece.color !== this.color) {
        moves.push(
          new Move(this.square, targetSquare, this, targetSquare.piece)
        );
      }
      break; // Stop searching in this direction (hit a piece)
    }

    // If empty square, add regular move
    moves.push(new Move(this.square, targetSquare, this));
  }

  // Down
  for (let r = row + 1; r < 8; r++) {
    const targetSquare = board.getSquare(r, col);

    if (targetSquare.isOccupied()) {
      // If occupied by enemy piece, add capture move
      if (targetSquare.piece.color !== this.color) {
        moves.push(
          new Move(this.square, targetSquare, this, targetSquare.piece)
        );
      }
      break; // Stop searching in this direction (hit a piece)
    }

    // If empty square, add regular move
    moves.push(new Move(this.square, targetSquare, this));
  }

  return moves;
}

export function getHorizontalMoves(board) {
  const moves = [];
  const { row, col } = this.square;

  // Left
  for (let c = col - 1; c >= 0; c--) {
    const targetSquare = board.getSquare(row, c);

    if (targetSquare.isOccupied()) {
      // If occupied by enemy piece, add capture move
      if (targetSquare.piece.color !== this.color) {
        moves.push(
          new Move(this.square, targetSquare, this, targetSquare.piece)
        );
      }
      break; // Stop searching in this direction (hit a piece)
    }

    // If empty square, add regular move
    moves.push(new Move(this.square, targetSquare, this));
  }

  // Right
  for (let c = col + 1; c < 8; c++) {
    const targetSquare = board.getSquare(row, c);

    if (targetSquare.isOccupied()) {
      // If occupied by enemy piece, add capture move
      if (targetSquare.piece.color !== this.color) {
        moves.push(
          new Move(this.square, targetSquare, this, targetSquare.piece)
        );
      }
      break; // Stop searching in this direction (hit a piece)
    }

    // If empty square, add regular move
    moves.push(new Move(this.square, targetSquare, this));
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
