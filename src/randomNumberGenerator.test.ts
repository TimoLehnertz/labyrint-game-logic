import { RandomNumberGenerator } from "./RandomNumberGenerator";

test("sameSeedSameNumbers", () => {
  const generator1 = new RandomNumberGenerator("Hello world");
  const generator2 = new RandomNumberGenerator("Hello world");
  for (let i = 0; i < 100; i++) {
    expect(generator1.rand()).toBe(generator2.rand());
  }
});

test("differentSeedDifferentNumbers", () => {
  const generator1 = new RandomNumberGenerator("Hello");
  const generator2 = new RandomNumberGenerator("World");
  for (let i = 0; i < 100; i++) {
    expect(generator1.rand() != generator2.rand()).toBeTruthy();
  }
});

test("averageRandom", () => {
  const generator = new RandomNumberGenerator("Average");
  const n = 1000;
  let average = 0;
  for (let i = 0; i < n; i++) {
    const number = generator.rand();
    average += number / n;
  }
  expect(Math.abs(average - 0.5) < 0.1).toBeTruthy();
});
