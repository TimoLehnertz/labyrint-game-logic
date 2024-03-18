/**
 * @author Timo Lehnertz
 */
import { Heading } from "./Heading";
import { TileType } from "./PathTile";

/**
 * Immutable OpenSides class representing the open sides of a tile
 */
export class OpenSides {
  public readonly northOpen: boolean;
  public readonly eastOpen: boolean;
  public readonly southOpen: boolean;
  public readonly westOpen: boolean;
  private headingsCache: Heading[] | null = null;

  public constructor(tileType: TileType, rotation: number) {
    switch (tileType) {
      case TileType.STREIGHT:
        this.northOpen = false;
        this.eastOpen = true;
        this.southOpen = false;
        this.westOpen = true;
        break;
      case TileType.L:
        this.northOpen = false;
        this.eastOpen = true;
        this.southOpen = true;
        this.westOpen = false;
        break;
      case TileType.T:
        this.northOpen = true;
        this.eastOpen = true;
        this.southOpen = false;
        this.westOpen = true;
        break;
    }
    while (rotation < 0) {
      rotation += 4;
    }
    for (let i = 0; i < rotation; i++) {
      const newNorthOpen: boolean = this.northOpen;
      const newEastOpen: boolean = this.eastOpen;
      const newSouthOpen: boolean = this.southOpen;
      const newWestOpen: boolean = this.westOpen;
      this.northOpen = newWestOpen;
      this.eastOpen = newNorthOpen;
      this.southOpen = newEastOpen;
      this.westOpen = newSouthOpen;
    }
  }

  public get headings(): Heading[] {
    if (this.headingsCache !== null) {
      return this.headingsCache;
    }
    this.headingsCache = [];
    if (this.northOpen) {
      this.headingsCache.push(Heading.NORTH);
    }
    if (this.eastOpen) {
      this.headingsCache.push(Heading.EAST);
    }
    if (this.southOpen) {
      this.headingsCache.push(Heading.SOUTH);
    }
    if (this.westOpen) {
      this.headingsCache.push(Heading.WEST);
    }
    return this.headingsCache;
  }
}
