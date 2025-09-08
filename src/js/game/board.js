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
  constructor(boardId, statusId = "status") {
    this.boardElement = document.getElementById(boardId);
    this.statusElement = document.getElementById(statusId);
    this.squares = [];
    this.currentTurn = 1; // 1 - white, 0 - black
    this.lastMove = null;
    this.gameOver = false;
    this.gameState = "normal"; // normal, check, checkmate, stalemate
    this.winner = null; // null, "white", "black", "draw"

    // click handling
    this.selectedSquare = null;
    this.selectedPiece = null;
    this.legalMovesForSelected = [];

    // Move history for tracking draws
    this.moveHistory = [];
    this.positionHistory = new Map(); // For threefold repetition
    this.halfMoveClock = 0; // For 50-move rule
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

  updateStatus() {
    if (!this.statusElement) return;

    const currentPlayer = this.currentTurn === 1 ? "White" : "Black";
    const opponent = this.currentTurn === 1 ? "Black" : "White";

    let statusText = "";

    switch (this.gameState) {
      case "checkmate":
        statusText = `🏆 CHECKMATE! ${opponent} Wins!`;
        this.statusElement.className = "status-checkmate";
        break;

      case "stalemate":
        statusText = `🤝 STALEMATE - It's a Draw!`;
        this.statusElement.className = "status-draw";
        break;

      case "draw-50-move":
        statusText = `🤝 DRAW - 50 Move Rule!`;
        this.statusElement.className = "status-draw";
        break;

      case "draw-repetition":
        statusText = `🤝 DRAW - Threefold Repetition!`;
        this.statusElement.className = "status-draw";
        break;

      case "draw-insufficient":
        statusText = `🤝 DRAW - Insufficient Material!`;
        this.statusElement.className = "status-draw";
        break;

      case "check":
        statusText = `⚠️ CHECK! ${currentPlayer} to move`;
        this.statusElement.className = "status-check";
        break;

      case "normal":
      default:
        statusText = `${currentPlayer} to move`;
        this.statusElement.className =
          this.currentTurn === 1 ? "status-white" : "status-black";
        break;
    }

    // Add move count if game is ongoing
    if (!this.gameOver) {
      const moveNumber = Math.floor(this.moveHistory.length / 2) + 1;
      statusText += ` • Move ${moveNumber}`;

      // Show last move if available
      if (this.lastMove) {
        const from = `${String.fromCharCode(
          97 + this.lastMove.fromSquare.col
        )}${8 - this.lastMove.fromSquare.row}`;
        const to = `${String.fromCharCode(97 + this.lastMove.toSquare.col)}${
          8 - this.lastMove.toSquare.row
        }`;
        statusText += ` • Last: ${from}-${to}`;
      }
    }

    this.statusElement.textContent = statusText;
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

  showGameOverMessage() {
    if (!this.gameOver) return;

    let message = "";
    switch (this.gameState) {
      case "checkmate":
        const winner = this.currentTurn === 1 ? "Black" : "White";
        message = `Game Over!\n${winner} wins by checkmate!`;
        break;
      case "stalemate":
        message = "Game Over!\nStalemate - It's a draw!";
        break;
      default:
        if (this.gameState.startsWith("draw-")) {
          message = "Game Over!\nIt's a draw!";
        }
    }

    if (message) {
      alert(message);
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

    // Track for draw conditions
    const wasCapture = move.toSquare.piece !== null;
    const wasPawnMove = move.piece.constructor.name === "Pawn";

    // Update half-move clock for 50-move rule
    if (wasCapture || wasPawnMove) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

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

    // Track move history
    this.moveHistory.push(move);
    this.lastMove = move;

    // Track position for repetition detection
    const position = this.getPositionKey();
    this.positionHistory.set(
      position,
      (this.positionHistory.get(position) || 0) + 1
    );

    // Switch turn
    this.currentTurn = this.currentTurn === 1 ? 0 : 1;

    // Check for draw conditions first
    if (this.checkDrawConditions()) {
      this.gameOver = true;
    } else {
      // Then evaluate game state (check, checkmate, stalemate)
      this.gameState = checkGameState(this);
      if (this.gameState === "checkmate" || this.gameState === "stalemate") {
        this.gameOver = true;
      }
    }

    this.updateUI();
    this.updateStatus();
    return true;
  }

  checkDrawConditions() {
    // 50-move rule
    if (this.halfMoveClock >= 100) {
      // 50 moves = 100 half-moves
      this.gameState = "draw-50-move";
      this.winner = "draw";
      return true;
    }

    // Threefold repetition
    for (const [position, count] of this.positionHistory) {
      if (count >= 3) {
        this.gameState = "draw-repetition";
        this.winner = "draw";
        return true;
      }
    }

    // Insufficient material
    if (this.hasInsufficientMaterial()) {
      this.gameState = "draw-insufficient";
      this.winner = "draw";
      return true;
    }

    return false;
  }

  hasInsufficientMaterial() {
    const pieces = this.squares.filter((sq) => sq.piece).map((sq) => sq.piece);
    const whitePieces = pieces.filter((p) => p.color === "white");
    const blackPieces = pieces.filter((p) => p.color === "black");

    // King vs King
    if (pieces.length === 2) return true;

    // King + minor piece vs King
    if (pieces.length === 3) {
      const minorPieces = pieces.filter(
        (p) =>
          p.constructor.name === "Bishop" || p.constructor.name === "Knight"
      );
      if (minorPieces.length === 1) return true;
    }

    // King + Bishop vs King + Bishop (same color squares)
    if (
      pieces.length === 4 &&
      whitePieces.length === 2 &&
      blackPieces.length === 2
    ) {
      const whiteBishops = whitePieces.filter(
        (p) => p.constructor.name === "Bishop"
      );
      const blackBishops = blackPieces.filter(
        (p) => p.constructor.name === "Bishop"
      );

      if (whiteBishops.length === 1 && blackBishops.length === 1) {
        const whiteSquareColor =
          (whiteBishops[0].square.row + whiteBishops[0].square.col) % 2;
        const blackSquareColor =
          (blackBishops[0].square.row + blackBishops[0].square.col) % 2;
        if (whiteSquareColor === blackSquareColor) return true;
      }
    }

    return false;
  }

  getPositionKey() {
    // Create a string representation of the current position
    let key = "";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.getSquare(r, c).piece;
        if (piece) {
          key += piece.constructor.name[0] + piece.color[0];
        } else {
          key += "--";
        }
      }
    }
    key += this.currentTurn;
    return key;
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

  resetGame() {
    // Reset game state
    this.currentTurn = 1;
    this.lastMove = null;
    this.gameOver = false;
    this.gameState = "normal";
    this.winner = null;
    this.selectedSquare = null;
    this.selectedPiece = null;
    this.legalMovesForSelected = [];
    this.moveHistory = [];
    this.positionHistory = new Map();
    this.halfMoveClock = 0;

    // Clear all squares
    this.squares.forEach((square) => {
      square.setPiece(null);
    });

    // Set up pieces again
    this.setupPieces();
    this.updateUI();

    console.log("Game reset");
  }
}
