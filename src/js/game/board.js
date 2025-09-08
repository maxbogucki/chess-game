import Square from "./square.js";
import Pawn from "../pieces/pawn.js";
import Rook from "../pieces/rook.js";
import Knight from "../pieces/knight.js";
import Bishop from "../pieces/bishop.js";
import Queen from "../pieces/queen.js";
import King from "../pieces/king.js";
import Move from "./move.js";

export default class Board {
  constructor(boardId) {
    this.boardElement = document.getElementById(boardId);
    this.squares = [];
    this.currentTurn = 1; // 1 - white, 0 - black
    this.lastMove = null;

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
    // Only select if there's a pieceon the square
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
    this.legalMovesForSelected = square.piece.getLegalMoves(this);

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

    // If a piece is selected, highlihgt it and its legal moves
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
    // Validate that the move is legal
    if (!this.isValidMove(move)) {
      return false;
    }

    // Handle en passant before removing original piece
    if (move.isEnPassant) {
      const capturedPawnSquare = this.getSquare(
        move.fromSquare.row,
        move.toSquare.col
      );
      capturedPawnSquare.setPiece(null);
    }

    // Remove piece from the original square
    move.fromSquare.setPiece(null);

    // If the move is a pawn promotion, replace with a Queen
    if (move.isPromotion) {
      const newPiece = new Queen(move.toSquare, move.piece.color);
      move.toSquare.setPiece(newPiece);
      newPiece.square = move.toSquare;
    } else {
      // Regular move
      move.toSquare.setPiece(move.piece);
      move.piece.square = move.toSquare;
    }

    // update the piece's internal square reference
    move.piece.square = move.toSquare;

    // mark that this piece has moved (useful later for castling etc.)
    move.piece.hasMoved = true;

    // Track last move
    this.lastMove = move;

    // Switch turn
    this.currentTurn = this.currentTurn === 1 ? 0 : 1;

    this.updateUI();

    return true;
  }

  isValidMove(move) {
    const legalMoves = move.piece.getLegalMoves(this);

    return legalMoves.some(
      (legalMove) =>
        legalMove.fromSquare === move.fromSquare &&
        legalMove.toSquare === move.toSquare
    );
  }
}
