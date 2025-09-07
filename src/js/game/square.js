export default class Square {
    constructor(row, col, color) {
        this.row = row;
        this.col = col;
        this.color = color;
        this.piece = null;
    }

    isOccupied() {
        return this.piece !== null;
    }

    setPiece(piece) {
        this.piece = piece;
    }
}