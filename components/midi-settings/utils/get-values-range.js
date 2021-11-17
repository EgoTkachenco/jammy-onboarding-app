export const getValuesRange = (start, end) => {
  return [...Array((end - start) + 1).keys()].map((number) => number + start);
}