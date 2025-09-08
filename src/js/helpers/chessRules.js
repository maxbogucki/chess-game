import Pawn from "../pieces/pawn.js";
import Rook from "../pieces/rook.js";
import Knight from "../pieces/knight.js";
import Bishop from "../pieces/bishop.js";
import Queen from "../pieces/queen.js";
import King from "../pieces/king.js";

function findKingSquare(board, color) {
  return board.squares.find(
    (sq) =>
      sq.piece &&
      sq.piece.constructor &&
      sq.piece.constructor.name === "King" &&
      sq.piece.color === color
  );
}

export function isInCheck(board, color) {
  const kingSquare = findKingSquare(board, color);
  if (!kingSquare) return false; // defensive

  const opponentColor = color === "white" ? "black" : "white";

  // iterate opponent pieces and see if any legal move targets the king square.
  // Using piece.getPseudoLegalMoves(board) for check detection (pseudo-legal attacks).
  for (const sq of board.squares) {
    const p = sq.piece;
    if (!p || p.color !== opponentColor) continue;
    const moves = p.getPseudoLegalMoves(board);
    for (const m of moves) {
      if (m.toSquare === kingSquare) return true;
    }
  }
  return false;
}

/**
 * applyTemporaryMove(board, move) -> undoObj
 * Apply a move on the board in a reversible way and return an undo object.
 * Handles en passant & promotion simulation.
 */
export function applyTemporaryMove(board, move) {
  const from = move.fromSquare;
  const to = move.toSquare;
  const movingPiece = move.piece;

  const undo = {
    fromSquare: from,
    toSquare: to,
    movingPiece,
    prevFromPiece: from.piece, // normally movingPiece
    prevToPiece: to.piece, // piece captured on destination (or null)
    prevHasMoved: movingPiece.hasMoved || false,
    epCapturedSquare: null,
    prevEpPiece: null,
    promotedPiece: null,
  };

  // Handle en passant capture (captured pawn is on from.row, to.col)
  if (move.isEnPassant) {
    const epSquare = board.getSquare(from.row, to.col);
    undo.epCapturedSquare = epSquare;
    undo.prevEpPiece = epSquare.piece;
    if (epSquare.piece) epSquare.setPiece(null);
  }

  // Remove piece from origin
  from.setPiece(null);

  // If the move is a promotion, place a Queen for simulation (sufficient for legality checks)
  if (move.isPromotion) {
    const promoted = new Queen(to, movingPiece.color);
    to.setPiece(promoted);
    promoted.square = to;
    undo.promotedPiece = promoted;
  } else {
    // Normal move (may overwrite captured piece)
    to.setPiece(movingPiece);
    movingPiece.square = to;
  }

  // mark piece as moved for future rules checks
  movingPiece.hasMoved = true;

  return undo;
}

/**
 * undoTemporaryMove(board, undo)
 * Revert a move applied by applyTemporaryMove.
 */
export function undoTemporaryMove(board, undo) {
  const {
    fromSquare,
    toSquare,
    movingPiece,
    prevToPiece,
    prevHasMoved,
    epCapturedSquare,
    prevEpPiece,
    promotedPiece,
    isCastle,
    castleRook,
    castleRookFrom,
    castleRookTo,
    prevRookHasMoved,
  } = undo;

  // Handle castling undo
  if (isCastle) {
    // Restore king
    toSquare.setPiece(null);
    fromSquare.setPiece(movingPiece);
    movingPiece.square = fromSquare;
    movingPiece.hasMoved = prevHasMoved;

    // Restore rook
    castleRookTo.setPiece(null);
    castleRookFrom.setPiece(castleRook);
    castleRook.square = castleRookFrom;
    castleRook.hasMoved = prevRookHasMoved;

    return;
  }

  // If we created a promoted piece, remove it and restore pawn to fromSquare
  if (promotedPiece) {
    // restore previously present piece on toSquare (could be captured piece)
    toSquare.setPiece(prevToPiece || null);
    if (prevToPiece) prevToPiece.square = toSquare;

    // restore pawn back to origin
    fromSquare.setPiece(movingPiece);
    movingPiece.square = fromSquare;
  } else {
    // Normal undo
    toSquare.setPiece(prevToPiece || null);
    if (prevToPiece) prevToPiece.square = toSquare;

    fromSquare.setPiece(movingPiece);
    movingPiece.square = fromSquare;
  }

  // Restore hasMoved
  movingPiece.hasMoved = prevHasMoved;

  // Restore en passant captured pawn if any
  if (epCapturedSquare) {
    epCapturedSquare.setPiece(prevEpPiece || null);
    if (prevEpPiece) prevEpPiece.square = epCapturedSquare;
  }
}

export function hasAnyLegalMove(board, color) {
  for (const sq of board.squares) {
    const p = sq.piece;
    if (!p || p.color !== color) continue;

    const moves = p.getPseudoLegalMoves(board);
    for (const move of moves) {
      const undo = applyTemporaryMove(board, move);
      const stillInCheck = isInCheck(board, color);
      undoTemporaryMove(board, undo);
      if (!stillInCheck) return true;
    }
  }
  return false;
}

export function checkGameState(board) {
  const color = board.currentTurn === 1 ? "white" : "black";
  const inCheck = isInCheck(board, color);
  const canMove = hasAnyLegalMove(board, color);

  if (inCheck && !canMove) return "checkmate";
  if (!inCheck && !canMove) return "stalemate";
  if (inCheck && canMove) return "check";
  return "normal";
}

export function isSameMove(m1, m2) {
  return (
    m1.fromSquare.row === m2.fromSquare.row &&
    m1.fromSquare.col === m2.fromSquare.col &&
    m1.toSquare.row === m2.toSquare.row &&
    m1.toSquare.col === m2.toSquare.col
  );
}
