import React, { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const base64Encode = (arrayBuffer: ArrayBuffer): string => {
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = "";

    // Process in chunks to avoid exceeding call stack limit
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      binaryString += String.fromCharCode(
        ...uint8Array.subarray(i, i + chunkSize)
      );
    }

    return btoa(binaryString);
  };

  const findMetadata = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const buffer = event.target!.result as ArrayBuffer;
        const data = new DataView(buffer);
        let i = 0;
        let metadata: any = { atoms: [] };

        while (i < data.byteLength) {
          if (i + 8 > data.byteLength) break;

          const atomSize = data.getUint32(i);
          const atomType = new TextDecoder("ascii").decode(
            buffer.slice(i + 4, i + 8)
          );

          if (atomSize < 8 || i + atomSize > data.byteLength) {
            reject("Invalid atom size.");
            return;
          }

          // Handle `moov` atom
          if (atomType === "moov") {
            const moovData = buffer.slice(i, i + atomSize);
            const moovDecoded = new TextDecoder("ascii").decode(moovData);
            console.log("moov atom (decoded):", moovDecoded);
            metadata.moov = base64Encode(moovData); // Optionally, base64 encode the moov atom
          }

          // Handle `ftyp` atom
          if (atomType === "ftyp") {
            const majorBrand = new TextDecoder("ascii").decode(
              buffer.slice(i + 8, i + 12)
            );
            const minorVersion = data.getUint32(i + 12);
            const compatibleBrands = new TextDecoder("ascii").decode(
              buffer.slice(i + 16, i + atomSize)
            );

            console.log("ftyp atom:");
            console.log("  Major Brand:", majorBrand);
            console.log("  Minor Version:", minorVersion);
            console.log("  Compatible Brands:", compatibleBrands);

            metadata.ftyp = {
              majorBrand,
              minorVersion,
              compatibleBrands,
            };
          }

          metadata.atoms.push({ type: atomType, size: atomSize });
          i += atomSize;
        }

        if (!metadata.moov) {
          reject("moov atom not found.");
        } else {
          resolve(metadata);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  async function reorderMoovToBeginning(
    inputFile: ArrayBuffer
  ): Promise<Buffer> {
    const data = new Uint8Array(inputFile);

    let moovAtom: Uint8Array | null = null;
    let mdatAtom: Uint8Array | null = null;
    let otherAtoms: Uint8Array[] = [];

    let offset = 0;
    while (offset < data.length) {
      const atomSize = new DataView(data.buffer).getUint32(offset, false);
      const atomType = new TextDecoder("ascii").decode(
        data.slice(offset + 4, offset + 8)
      );

      if (atomType === "moov") {
        moovAtom = data.slice(offset, offset + atomSize);
      } else if (atomType === "mdat") {
        mdatAtom = data.slice(offset, offset + atomSize);
      } else {
        otherAtoms.push(data.slice(offset, offset + atomSize));
      }

      offset += atomSize;
    }

    if (!moovAtom || !mdatAtom) {
      throw new Error("MP4 file must contain both 'moov' and 'mdat' atoms.");
    }

    // Adjust offsets in moov atom
    const adjustedMoovAtom = adjustMoovOffsets(moovAtom, otherAtoms);

    // Combine atoms: ftyp + moov + mdat
    const reorderedData = Buffer.concat([
      ...otherAtoms.map(Buffer.from), // Any atoms before moov (e.g., ftyp)
      Buffer.from(adjustedMoovAtom), // Adjusted moov atom
      Buffer.from(mdatAtom), // mdat atom
    ]);

    return reorderedData;
  }

  // Adjust offsets in moov atom
  function adjustMoovOffsets(
    moovAtom: Uint8Array,
    adjustment: number
  ): Uint8Array {
    const moovData = new Uint8Array(moovAtom);

    const updateOffsets = (atomType: string, size: number) => {
      const offset = findAtomOffset(moovData, atomType);
      if (offset !== -1) {
        const entryCount = new DataView(moovData.buffer).getUint32(
          offset + 4,
          false
        );
        for (let i = 0; i < entryCount; i++) {
          const currentOffset =
            size === 4
              ? new DataView(moovData.buffer).getUint32(
                  offset + 8 + i * size,
                  false
                )
              : new DataView(moovData.buffer).getBigUint64(
                  offset + 8 + i * size,
                  false
                );
          const newOffset = currentOffset + BigInt(adjustment);

          if (size === 4) {
            new DataView(moovData.buffer).setUint32(
              offset + 8 + i * size,
              Number(newOffset),
              false
            );
          } else {
            new DataView(moovData.buffer).setBigUint64(
              offset + 8 + i * size,
              newOffset,
              false
            );
          }
        }
      }
    };

    // Update both stco (32-bit offsets) and co64 (64-bit offsets)
    updateOffsets("stco", 4); // 32-bit offsets
    updateOffsets("co64", 8); // 64-bit offsets

    return moovData;
  }

  // Find atom offset
  function findAtomOffset(buffer: Uint8Array, atomType: string): number {
    let offset = 0;
    while (offset < buffer.length) {
      const atomSize = new DataView(buffer.buffer).getUint32(offset, false);
      const atomTypeString = new TextDecoder().decode(
        buffer.slice(offset + 4, offset + 8)
      );
      if (atomTypeString === atomType) {
        return offset;
      }
      offset += atomSize;
    }
    return -1; // Atom not found
  }

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    const fileBuffer = await file.arrayBuffer();

    const url = "https://localhost:8045/upload-video/";
    const formData = new FormData();

    // Append metadata as a JSON string
    const metadataData = await findMetadata(file);
    console.log(metadataData);
    formData.append("metadata", JSON.stringify(metadataData));

    const reorderedFile = await reorderMoovToBeginning(fileBuffer);
    formData.append("file", new Blob([reorderedFile]), file.name);

    try {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onerror = () => {
        setUploadStatus("An error occurred during the upload.");
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("An unexpected error occurred.");
    }
  };

  // Handle drag over event to allow drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Optionally, you can add styles to show drop zone active (e.g., change color)
  };

  // Handle drag leave event (optional, to reset styles)
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset styles here if necessary
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const file = droppedFiles[0];
      setFile(file); // Set the file to the state (or handle it further)
    }
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: "300px",
          height: "200px",
          border: "2px dashed #aaa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
          color: "#aaa",
          cursor: "pointer",
        }}
      >
        <p>{file ? file.name : "Drag a file here or select one"}</p>
      </div>

      <input
        type='file'
        onChange={handleFileChange}
        style={{ marginTop: "10px" }}
      />
      <button onClick={handleFileUpload} style={{ marginTop: "10px" }}>
        Upload
      </button>

      {uploadProgress > 0 && <p>Progress: {uploadProgress}%</p>}
      {uploadStatus && <p>Status: {uploadStatus}</p>}
    </div>
  );
}
