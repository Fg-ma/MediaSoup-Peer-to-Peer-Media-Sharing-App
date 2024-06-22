const flattenArray = (arr: number[][], maxLength: number): Float32Array => {
  const result = new Float32Array(2 * maxLength);
  for (let i = 0; i < arr.length; i++) {
    result[i * 2] = arr[i][0];
    result[i * 2 + 1] = arr[i][1];
  }
  return result;
};

export default flattenArray;
