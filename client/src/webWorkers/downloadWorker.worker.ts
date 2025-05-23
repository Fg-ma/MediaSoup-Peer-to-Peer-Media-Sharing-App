onmessage = function (e) {
  const { buffer, mimeType } = e.data;
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  postMessage({ blob });
};
