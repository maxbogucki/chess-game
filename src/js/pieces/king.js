import Piece from "./piece.js";
import Move from "../game/move.js";
import {
  applyTemporaryMove,
  undoTemporaryMove,
  isInCheck,
} from "../helpers/chessRules.js";

export default class King extends Piece {
  constructor(square, color) {
    super(square, color);
  }

  getSymbol() {
    return this.color === "white" ? "♔" : "♚";
  }

  // Basic king moves WITHOUT castling - used for check detection
  getPseudoLegalMoves(board) {
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

    // NOTE: We do NOT add castling moves here to prevent recursion
    return moves;
  }

  // All possible moves INCLUDING castling - used by game interface
  getAllPossibleMoves(board) {
    // Get basic moves first
    const moves = this.getPseudoLegalMoves(board);

    // Add castling moves
    moves.push(...this.getCastlingMoves(board));

    return moves;
  }

  getCastlingMoves(board) {
    const moves = [];

    // Can't castle if king has moved
    if (this.hasMoved) {
      return moves;
    }

    const { row, col } = this.square;

    // Kingside castling (short castle)
    const kingsideRookSquare = board.getSquare(row, 7);
    if (this.canCastle(board, kingsideRookSquare, "kingside")) {
      const castleMove = new Move(this.square, board.getSquare(row, 6), this);
      castleMove.isCastle = true;
      castleMove.castleRookFrom = kingsideRookSquare;
      castleMove.castleRookTo = board.getSquare(row, 5);
      moves.push(castleMove);
    }

    // Queenside castling (long castle)
    const queensideRookSquare = board.getSquare(row, 0);
    if (this.canCastle(board, queensideRookSquare, "queenside")) {
      const castleMove = new Move(this.square, board.getSquare(row, 2), this);
      castleMove.isCastle = true;
      castleMove.castleRookFrom = queensideRookSquare;
      castleMove.castleRookTo = board.getSquare(row, 3);
      moves.push(castleMove);
    }

    return moves;
  }

  canCastle(board, rookSquare, side) {
    // Check if rook exists and hasn't moved
    if (
      !rookSquare.isOccupied() ||
      rookSquare.piece.constructor.name !== "Rook" ||
      rookSquare.piece.color !== this.color ||
      rookSquare.piece.hasMoved
    ) {
      return false;
    }

    const { row, col } = this.square;

    // Check if path is clear
    if (side === "kingside") {
      // Check squares between king and rook (f and g)
      for (let c = 5; c <= 6; c++) {
        if (board.getSquare(row, c).isOccupied()) {
          return false;
        }
      }
    } else {
      // queenside: check b, c, d (columns 1..3)
      for (let c = 1; c <= 3; c++) {
        if (board.getSquare(row, c).isOccupied()) {
          return false;
        }
      }
    }

    // Can't castle if king is currently in check
    // This is now safe because isInCheck only uses getPseudoLegalMoves (no castling)
    if (isInCheck(board, this.color)) return false;

    // Can't castle if any square the king passes through (or ends on) is attacked
    const colsToCheck = [];
    if (side === "kingside") {
      colsToCheck.push(col + 1, col + 2);
    } else {
      colsToCheck.push(col - 1, col - 2);
    }

    for (const c of colsToCheck) {
      // ensure in board bounds (defensive)
      if (c < 0 || c > 7) return false;

      const targetSquare = board.getSquare(row, c);
      // Build a pseudo move that moves the king to targetSquare
      const tempMove = new Move(this.square, targetSquare, this);

      const undo = applyTemporaryMove(board, tempMove);
      const kingInCheckAfterMove = isInCheck(board, this.color);
      undoTemporaryMove(board, undo);

      if (kingInCheckAfterMove) {
        return false; // can't pass through or land on an attacked square
      }
    }

    // All checks passed
    return true;
  }
}
