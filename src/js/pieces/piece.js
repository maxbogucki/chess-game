export default class Piece {
    constructor(square, color) {
        this.square = square;
        this.color = color;
    }

    // will be implemented in subclasses
    getLegalMoves(board) {
        return [];
    }
}