export default class Piece {
    constructor(square, color) {
        this.square = square;
        this.color = color;
        this.hasMoved = false;
    }

    getSymbol() {
        return "";
    }

    getPseudoLegalMoves(board) {
        return [];
    }
}