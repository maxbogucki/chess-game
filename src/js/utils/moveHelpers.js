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
      break; // Stop searching in this direction
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
      break; // Stop searching in this direction
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
      break; // Stop searching in this direction
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
      break; // Stop searching in this direction
    }

    // If empty square, add regular move
    moves.push(new Move(this.square, targetSquare, this));
  }

  return moves;
}
