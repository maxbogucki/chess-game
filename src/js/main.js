import Game from "./game/game.js";

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game("chess-board");
  game.init();
});
