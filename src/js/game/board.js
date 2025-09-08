import Square from "./square.js";
import Pawn from "../pieces/pawn.js";
import Rook from "../pieces/rook.js";
import Knight from "../pieces/knight.js";
import Bishop from "../pieces/bishop.js";
import Queen from "../pieces/queen.js";
import King from "../pieces/king.js";
import Move from "./move.js";

import {
  isInCheck,
  checkGameState,
  applyTemporaryMove,
  undoTemporaryMove,
  isSameMove,
} from "../helpers/chessRules.js";

export default class Board {
  constructor(boardId) {
    this.boardElement = document.getElementById(boardId);
    this.squares = [];
    this.currentTurn = 1; // 1 - white, 0 - black
    this.lastMove = null;
    this.gameOver = false;

    // click handling
    this.selectedSquare = null;
    this.selectedPiece = null;
    this.legalMovesForSelected = [];
  }

  render() {
    this.boardElement.innerHTML = "";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const color = (r + c) % 2 === 0 ? "light" : "dark";
        const square = new Square(r, c, color);
        const div = document.createElement("div");
        div.classList.add("square", color);
        div.dataset.r = r;
        div.dataset.c = c;
        square.element = div;

        // Add click event listener to each square
        div.addEventListener("click", () => this.handleSquareClick(square));

        this.boardElement.appendChild(div);
        this.squares.push(square);
      }
    }

    this.setupPieces();
    this.updateUI();
  }

  handleSquareClick(clickedSquare) {
    if (this.gameOver) return;

    // If no piece is selected yet
    if (!this.selectedPiece) {
      this.selectPiece(clickedSquare);
    }
    // If a piece is already selected
    else {
      // If clicking on the same square, deselect
      if (clickedSquare === this.selectedSquare) {
        this.deselectPiece();
      }
      // If clicking on another piece of the same color, select that piece instead
      else if (
        clickedSquare.piece &&
        clickedSquare.piece.color === this.selectedPiece.color
      ) {
        this.deselectPiece();
        this.selectPiece(clickedSquare);
      }
      // Try to move to the clicked square
      else {
        this.tryMove(clickedSquare);
      }
    }
  }

  selectPiece(square) {
    // Only select if there's a piece on the square
    if (!square.piece) {
      return;
    }

    // Ensure correct turn (1 = white, 0 = black)
    if (
      (this.currentTurn === 1 && square.piece.color !== "white") ||
      (this.currentTurn === 0 && square.piece.color !== "black")
    ) {
      return; // Wrong turn, ignore click
    }

    this.selectedSquare = square;
    this.selectedPiece = square.piece;
    this.legalMovesForSelected = this.getLegalMovesForPiece(square.piece);

    this.updateSelectionUI();
  }

  deselectPiece() {
    this.selectedSquare = null;
    this.selectedPiece = null;
    this.legalMovesForSelected = [];

    this.updateSelectionUI();
  }

  tryMove(targetSquare) {
    // Try to find a matching legal move that was computed when the piece was selected.
    const legalMove = this.legalMovesForSelected.find(
      (m) => m.fromSquare === this.selectedSquare && m.toSquare === targetSquare
    );

    // Use the legal move object if found (preserves flags like isEnPassant / isDoublePawnPush),
    // otherwise fall back to constructing a minimal Move (shouldn't normally be needed).
    const move =
      legalMove ||
      new Move(
        this.selectedSquare,
        targetSquare,
        this.selectedPiece,
        targetSquare.piece
      );

    if (this.makeMove(move)) {
      this.deselectPiece();
    } else {
      console.log("Invalid move attempted");
    }
  }

  setupPieces() {
    const backRank = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];

    for (let c = 0; c < 8; c++) {
      // Black pieces
      this.placePiece(new backRank[c](this.getSquare(0, c), "black"));
      this.placePiece(new Pawn(this.getSquare(1, c), "black"));

      // White pieces
      this.placePiece(new backRank[c](this.getSquare(7, c), "white"));
      this.placePiece(new Pawn(this.getSquare(6, c), "white"));
    }
  }

  placePiece(piece) {
    piece.square.setPiece(piece);
  }

  getSquare(row, col) {
    return this.squares[row * 8 + col];
  }

  updateSelectionUI() {
    // Clear all previous selection highlights
    this.squares.forEach((square) => {
      square.element.classList.remove("selected", "legal-move");
    });

    // If a piece is selected, highlight it and its legal moves
    if (this.selectedPiece) {
      // Highlight selected square
      this.selectedSquare.element.classList.add("selected");

      // Highlight legal moves
      this.legalMovesForSelected.forEach((move) => {
        move.toSquare.element.classList.add("legal-move");
      });
    }
  }

  updateUI() {
    this.squares.forEach((square) => {
      // Clear ALL piece-related classes first
      square.element.classList.remove("white", "black");

      if (square.piece) {
        square.element.textContent = square.piece.getSymbol();
        square.element.classList.add(square.piece.color); // Add classes white/black
      } else {
        square.element.textContent = "";
      }
    });

    // Maintain selection highlights after the UI update
    this.updateSelectionUI();
  }

  makeMove(move) {
    const legalMoves = this.getLegalMovesForPiece(move.piece);
    const isLegal = legalMoves.some((m) => isSameMove(m, move));
    if (!isLegal) return false;

    // Handle castling
    if (move.isCastle) {
      // Move the king
      move.fromSquare.setPiece(null);
      move.toSquare.setPiece(move.piece);
      move.piece.square = move.toSquare;
      move.piece.hasMoved = true;

      // Move the rook
      const rook = move.castleRookFrom.piece;
      move.castleRookFrom.setPiece(null);
      move.castleRookTo.setPiece(rook);
      rook.square = move.castleRookTo;
      rook.hasMoved = true;
    }
    // Handle en passant
    else if (move.isEnPassant) {
      const capturedPawnSquare = this.getSquare(
        move.fromSquare.row,
        move.toSquare.col
      );
      capturedPawnSquare.setPiece(null);
      move.fromSquare.setPiece(null);
      move.toSquare.setPiece(move.piece);
      move.piece.square = move.toSquare;
      move.piece.hasMoved = true;
    }
    // Handle promotion
    else if (move.isPromotion) {
      move.fromSquare.setPiece(null);
      const newPiece = new Queen(move.toSquare, move.piece.color);
      move.toSquare.setPiece(newPiece);
      newPiece.square = move.toSquare;
      newPiece.hasMoved = true;
      move.piece = newPiece;
    }
    // Regular move
    else {
      move.fromSquare.setPiece(null);
      move.toSquare.setPiece(move.piece);
      move.piece.square = move.toSquare;
      move.piece.hasMoved = true;
    }

    // Track last move
    this.lastMove = move;

    // Switch turn
    this.currentTurn = this.currentTurn === 1 ? 0 : 1;

    // After the move, evaluate game state
    const state = checkGameState(this);
    if (state === "checkmate") {
      this.gameOver = true;
      console.log("Checkmate!");
    } else if (state === "stalemate") {
      this.gameOver = true;
      console.log("Stalemate!");
    } else if (state === "check") {
      console.log("Check!");
    }

    this.updateUI();
    return true;
  }

  getLegalMovesForPiece(piece) {
    const pseudoMoves =
      piece instanceof King
        ? piece.getAllPossibleMoves(this)
        : piece.getPseudoLegalMoves(this);

    return this.filterLegalMoves(pseudoMoves, piece.color);
  }

  filterLegalMoves(moves, color) {
    return moves.filter((move) => {
      const undo = applyTemporaryMove(this, move);
      const inCheck = isInCheck(this, color);
      undoTemporaryMove(this, undo);
      return !inCheck;
    });
  }
}
