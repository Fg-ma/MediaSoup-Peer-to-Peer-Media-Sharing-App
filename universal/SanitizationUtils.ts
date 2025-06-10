import { mimeTypeContentTypeSet } from "./contentTypeConstant";

class SanitizationUtils {
  /**
   * Entry point for sanitizing an object deeply with optional whitelisting.
   *
   * @param object - The object to sanitize
   * @param whitelistMap - Optional map of field names to extra allowed characters
   * @returns A sanitized and safe object
   */
  sanitizeObject = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: Record<string, any>,
    whitelistMap: Record<string, string> = {},
    validateHexList: string[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> => {
    return this.sanitizeValue(object, whitelistMap, validateHexList);
  };

  /**
   * Recursively sanitizes a value (string, object, array), allowing per-key whitelists.
   *
   * @param value - The value to sanitize
   * @param whitelistMap - Field-specific extra allowed characters
   * @param currentKey - The current key being sanitized (used for whitelist lookup)
   */
  sanitizeValue = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    whitelistMap: Record<string, string> = {},
    validateHexList: string[] = [],
    currentKey = ""
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => {
    if (typeof value === "string") {
      const validateHex = validateHexList.includes(currentKey);
      if (!validateHex) {
        const extraAllowed = whitelistMap[currentKey] || "";
        return this.sanitizeString(value, extraAllowed);
      } else {
        return this.validateHexColor(value);
      }
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      value instanceof Uint8Array ||
      value === null
    ) {
      return value; // Allow numbers, booleans, null, and Uint8Array as-is
    }

    if (Array.isArray(value)) {
      return value.map((item) =>
        this.sanitizeValue(item, whitelistMap, validateHexList, currentKey)
      );
    }

    if (typeof value === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newObj: Record<string, any> = {};
      Object.entries(value).forEach(([key, val]) => {
        newObj[key] = this.sanitizeValue(
          val,
          whitelistMap,
          validateHexList,
          key
        );
      });
      return newObj;
    }

    return "ihearttabletop";
  };

  /**
   * Sanitizes a string by removing unsafe characters, with optional extra allowed characters.
   *
   * @param input - The string to sanitize
   * @param extraAllowed - Extra characters to allow in addition to the default set
   * @returns A sanitized and safe string
   */
  sanitizeString = (input: string, extraAllowed = ""): string => {
    if (input === "") {
      return "";
    }

    const uniqueExtra = [...new Set(extraAllowed)].join("");
    const escapedExtra = uniqueExtra.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`[^-a-zA-Z0-9._${escapedExtra}]`, "g");

    // Normalize and sanitize
    let sanitized = input.normalize("NFKC").replace(regex, "");

    // Prevent empty or hidden strings
    if (!sanitized || sanitized.startsWith(".")) {
      sanitized = "ihearttabletop";
    }

    return sanitized;
  };

  /**
   * Validates if a string is a proper hex color code.
   * Returns the input if valid, otherwise returns "#ffffff".
   *
   * @param input - The color string to validate
   * @returns A valid hex color string
   */
  validateHexColor = (input: string): string => {
    const normalized = input.trim().toLowerCase();
    const isValid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized);
    return isValid ? normalized : "#ffffff";
  };

  /**
   * Sanitizes and validates a MIME type against the allowed list.
   *
   * @param mimeType - The MIME type to check
   * @returns A valid MIME type or `null` if invalid
   */
  sanitizeMimeType = (mimeType: string) => {
    // Normalize input by trimming whitespace
    const sanitized = mimeType.trim().toLowerCase();

    // Check if it's in the allowed list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mimeTypeContentTypeSet.has(sanitized as any) ? sanitized : undefined;
  };
}

export default SanitizationUtils;
