import { BoardPosition } from "./BoardPosition";
import { Heading } from "./Heading";
import { ShiftPosition } from "./ShiftPosition";

test("shiftPlayer x axis", () => {
  // not affected
  let shiftPosition = new ShiftPosition(Heading.EAST, 0);
  let playerPos = shiftPosition.shiftPlayer(new BoardPosition(0, 0), 7, 7);
  expect(playerPos.equals(new BoardPosition(0, 0))).toBeTruthy();
  // + 1
  shiftPosition = new ShiftPosition(Heading.WEST, 1);
  playerPos = shiftPosition.shiftPlayer(new BoardPosition(3, 3), 7, 7);
  expect(playerPos.equals(new BoardPosition(4, 3))).toBeTruthy();
  // - 1
  shiftPosition = new ShiftPosition(Heading.EAST, 1);
  playerPos = shiftPosition.shiftPlayer(new BoardPosition(3, 3), 7, 7);
  expect(playerPos.equals(new BoardPosition(2, 3))).toBeTruthy();
  // overflow EAST
  shiftPosition = new ShiftPosition(Heading.WEST, 1);
  playerPos = shiftPosition.shiftPlayer(new BoardPosition(6, 3), 7, 7);
  expect(playerPos.equals(new BoardPosition(0, 3))).toBeTruthy();
  // overflow WEST
  shiftPosition = new ShiftPosition(Heading.EAST, 1);
  playerPos = shiftPosition.shiftPlayer(new BoardPosition(0, 3), 7, 7);
  expect(playerPos.equals(new BoardPosition(6, 3))).toBeTruthy();
});

test("shiftPlayer y axis", () => {
  // not affected
  let shiftPosition = new ShiftPosition(Heading.NORTH, 0);
  let playerPos = shiftPosition.shiftPlayer(new BoardPosition(0, 0), 7, 7);
  expect(playerPos.equals(new BoardPosition(0, 0))).toBeTruthy();

  // + 1
  shiftPosition = new ShiftPosition(Heading.NORTH, 1);
  playerPos = shiftPosition.shiftPlayer(new BoardPosition(3, 3), 7, 7);
  expect(playerPos.equals(new BoardPosition(3, 4))).toBeTruthy();

  // - 1
  shiftPosition = new ShiftPosition(Heading.SOUTH, 1);
  playerPos = shiftPosition.shiftPlayer(new BoardPosition(3, 3), 7, 7);
  expect(playerPos.equals(new BoardPosition(3, 2))).toBeTruthy();

  // overflow EAST
  shiftPosition = new ShiftPosition(Heading.NORTH, 1);
  playerPos = shiftPosition.shiftPlayer(new BoardPosition(3, 6), 7, 7);

  console.log(playerPos);
  expect(playerPos.equals(new BoardPosition(3, 0))).toBeTruthy();

  // overflow WEST
  shiftPosition = new ShiftPosition(Heading.SOUTH, 1);
  playerPos = shiftPosition.shiftPlayer(new BoardPosition(3, 0), 7, 7);
  expect(playerPos.equals(new BoardPosition(3, 6))).toBeTruthy();
});
