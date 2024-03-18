# labyrint-game-logic

## example

const playerRed = new Player((readonlyGameState) => Promise<move>);
const playerGreen = new Player((readonlyGameState) => Promise<move>);
const playerYellow = new Player((readonlyGameState) => Promise<move>);

const randomBoard = Game.generateRandomBoard();

const game = new Game({ playerGreen, playerRed, playerYellow, board: randomBoard });

game.addEventListener('gameended', (winner) => {})
game.addEventListener('playermoved', (move) => {})
game.addEventListener('treasurefound', (player, treasure) => {})

game.start()
