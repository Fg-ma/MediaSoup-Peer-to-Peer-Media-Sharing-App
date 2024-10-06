class EXRLoader {
  async load(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return this.parseEXR(arrayBuffer);
  }

  parseEXR(buffer: ArrayBuffer) {
    const dataView = new DataView(buffer);
    let offset = 0;

    // EXR magic number
    const magic = dataView.getUint32(offset, true);
    offset += 4;
    if (magic !== 20000630) {
      throw new Error("Not a valid EXR file.");
    }

    // Version field (4 bytes)
    const version = dataView.getUint32(offset, true); // Corrected to read as Uint32
    offset += 4;
    if (version !== 2) {
      throw new Error("Unsupported EXR version.");
    }

    // Read header (key-value pairs until an empty string key is found)
    let width = 0,
      height = 0;
    let channels = [];

    while (true) {
      const key = this.readNullTerminatedString(dataView, offset);
      offset += key.length + 1;

      if (key === "") break;

      const attributeType = this.readNullTerminatedString(dataView, offset);
      offset += attributeType.length + 1;

      const size = dataView.getUint32(offset, true);
      offset += 4;

      if (key === "dataWindow") {
        const xMin = dataView.getInt32(offset, true);
        const yMin = dataView.getInt32(offset + 4, true);
        const xMax = dataView.getInt32(offset + 8, true);
        const yMax = dataView.getInt32(offset + 12, true);
        width = xMax - xMin + 1;
        height = yMax - yMin + 1;
      } else if (key === "channels") {
        for (let i = 0; i < size; i += 18) {
          const channelName = this.readNullTerminatedString(
            dataView,
            offset + i
          );
          channels.push(channelName);
        }
      }

      offset += size;
    }

    // Validate we found the necessary information
    if (width === 0 || height === 0 || channels.length === 0) {
      throw new Error("Invalid EXR header: missing dimensions or channels.");
    }

    // Prepare to read pixel data
    const numPixels = width * height;
    const pixelData = new Float32Array(numPixels * 3); // RGB (3 channels)

    // Move to pixel data (assuming scanline storage, no compression)
    for (let y = 0; y < height; y++) {
      // Check if the offset is within bounds before reading scanline y coordinate
      if (offset + 4 > buffer.byteLength) {
        throw new Error("Offset exceeds buffer length while reading scanline.");
      }

      const scanlineY = dataView.getInt32(offset, true);
      offset += 4;

      // Read pixel data for this scanline (in channel order)
      for (
        let channelIndex = 0;
        channelIndex < channels.length;
        channelIndex++
      ) {
        for (let x = 0; x < width; x++) {
          // Check the offset before reading pixel data
          if (offset + 4 > buffer.byteLength) {
            throw new Error(
              "Offset exceeds buffer length while reading pixel data."
            );
          }

          const pixelValue = dataView.getFloat32(offset, true);
          offset += 4;

          // Assign pixel values based on channel names
          if (channels[channelIndex] === "R") {
            pixelData[(y * width + x) * 3] = pixelValue; // Red
          } else if (channels[channelIndex] === "G") {
            pixelData[(y * width + x) * 3 + 1] = pixelValue; // Green
          } else if (channels[channelIndex] === "B") {
            pixelData[(y * width + x) * 3 + 2] = pixelValue; // Blue
          }
        }
      }
    }

    return {
      width: width,
      height: height,
      data: pixelData,
    };
  }

  // Helper function to read null-terminated strings from the EXR header
  readNullTerminatedString(dataView: DataView, offset: number) {
    let str = "";
    while (true) {
      const char = dataView.getUint8(offset);
      if (char === 0) break;
      str += String.fromCharCode(char);
      offset++;
    }
    return str;
  }
}

export default EXRLoader;
