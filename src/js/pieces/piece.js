export default class Piece {
    constructor(square, color) {
        this.square = square;
        this.color = color;
    }

    getSymbol() {
        return "";
    }

    getLegalMoves(board) {
        return [];
    }
}