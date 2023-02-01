export function zeros(value: number, i = 0) {
  return value >= 10 ? zeros(value / 10, ++i) : i;
}
