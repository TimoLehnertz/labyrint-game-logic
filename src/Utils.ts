import { Board } from "./Board";
import { BoardPosition } from "./BoardPosition";
import { PathTile, TileType } from "./PathTile";

export function printBoard(board: Board) {
  for (let y = 0; y < board.height; y++) {
    let row = "";
    for (let x = 0; x < board.height; x++) {
      row += `| ${stringifyTile(board.getTile(new BoardPosition(x, y)))} |`;
    }
    console.log(row);
  }
}

export function stringifyTile(pathTile: PathTile): string {
  switch (pathTile.tileType) {
    case TileType.L:
      return `L-${pathTile.rotation}`;
    case TileType.T:
      return `T-${pathTile.rotation}`;
    case TileType.STREIGHT:
      return `S-${pathTile.rotation}`;
  }
}

export function printDistances(distances: number[][]) {
  for (let y = 0; y < distances.length; y++) {
    let rowStr = "";
    for (let x = 0; x < distances[0].length; x++) {
      rowStr += `| ${distances[x][y]} |`;
    }
    console.log(rowStr);
  }
}
