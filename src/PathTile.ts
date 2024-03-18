/**
 * @author Timo lehnertz
 */
import { OpenSides } from "./OpenSides";
import { Treasure } from "./Treasure";

export enum TileType {
  STREIGHT,
  L,
  T,
}

/**
 * Immutable Tile class representing a single tile
 */
export class PathTile {
  /**
   * Key
   */
  public readonly tileType: TileType;
  public readonly treasure: Treasure | null;
  public readonly rotation: number;
  public readonly homeOfPlayerIndex: number | null;
  private openSidesCache: OpenSides | null = null;

  public constructor(
    tileType: TileType,
    treasure: Treasure | null,
    rotation: number,
    homeOfPlayerIndex: number | null
  ) {
    this.tileType = tileType;
    this.treasure = treasure;
    this.rotation = rotation;
    this.homeOfPlayerIndex = homeOfPlayerIndex;
  }

  public get openSides(): OpenSides {
    if (this.openSidesCache !== null) {
      return this.openSidesCache;
    }
    this.openSidesCache = new OpenSides(this.tileType, this.rotation);
    return this.openSidesCache;
  }

  public rotate(repeat: number = 1): PathTile {
    if (repeat === 0) {
      return this;
    }
    return new PathTile(
      this.tileType,
      this.treasure,
      this.rotation + repeat,
      this.homeOfPlayerIndex
    );
  }

  public setHomeOfPlayerIndex(homeOfPlayerIndex: number): PathTile {
    return new PathTile(
      this.tileType,
      this.treasure,
      this.rotation,
      homeOfPlayerIndex
    );
  }

  public setTreasure(treasure: Treasure | null): PathTile {
    return new PathTile(
      this.tileType,
      treasure,
      this.rotation,
      this.homeOfPlayerIndex
    );
  }
}
