export default class Move {
  constructor(fromSquare, toSquare, piece, capturedPiece = null) {
    this.fromSquare = fromSquare;
    this.toSquare = toSquare;
    this.piece = piece;
    this.capturedPiece = capturedPiece;

    // special moves
    this.isDoublePawnPush = false;
    this.isEnPassant = false;
    this.isPromotion = false;
    this.promotionPiece = null;
  }
}
