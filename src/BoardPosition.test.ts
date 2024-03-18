import { BoardPosition } from "./BoardPosition";

test("add", () => {
  const boardPositionA = new BoardPosition(1, 2);
  const boardPositionB = new BoardPosition(5, -3);
  const boardPositionC = boardPositionA.add(boardPositionB);
  expect(boardPositionC.x).toBe(6);
  expect(boardPositionC.y).toBe(-1);
});

test("isInBounds", () => {
  const boardPositionA = new BoardPosition(1, 2);
  expect(boardPositionA.isInBounds(7, 7)).toBeTruthy();

  const boardPositionB = new BoardPosition(9, 0);
  expect(boardPositionB.isInBounds(7, 7)).toBeFalsy();

  const boardPositionC = new BoardPosition(-1, 0);
  expect(boardPositionC.isInBounds(7, 7)).toBeFalsy();

  const boardPositionD = new BoardPosition(0, -1);
  expect(boardPositionD.isInBounds(7, 7)).toBeFalsy();
});
