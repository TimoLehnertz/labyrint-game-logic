import { Cyrb64 } from "./Cyrb64";

test("hash same", () => {
  const hashA = Cyrb64.hashString("Hello world", 1);
  const hashB = Cyrb64.hashString("Hello world", 1);
  expect(hashA.equals(hashB)).toBeTruthy();
});

test("hash different", () => {
  const hashA = Cyrb64.hashString("Hello world", 1);
  const hashB = Cyrb64.hashString("Hello world1", 1);
  expect(hashA.equals(hashB)).toBeFalsy();
});

test("different seed", () => {
  const hashA = Cyrb64.hashString("Hello world", 1);
  const hashB = Cyrb64.hashString("Hello world", 2);
  expect(hashA.equals(hashB)).toBeFalsy();
});
