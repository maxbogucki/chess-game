export default class Move {
    constructor(fromSquare, toSquare, piece, capturiedPiece = null) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.piece = piece;
        this.capturiedPiece = capturiedPiece;
    }
}