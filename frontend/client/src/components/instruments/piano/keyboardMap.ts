// keyboardMap.ts
// white row keys (left->right) mapped to visible white keys indices
export const WHITE_ROW = ["a","s","d","f","g","h","j","k","l",";","'","z","x","c","v","b","n","m"];
// top row for black-ish
export const BLACK_ROW = ["w","e","t","y","u","o","p"];

export function buildKeyboardMapForVisible(visibleLength: number) {
  const map = new Map<string, number>();
  for (let i = 0; i < visibleLength && i < WHITE_ROW.length; i++) {
    map.set(WHITE_ROW[i], i);
  }
  // black row map for convenience (maps to approx index)
  for (let i = 0; i < visibleLength && i < BLACK_ROW.length; i++) {
    map.set(BLACK_ROW[i], i);
  }
  return map;
}
    