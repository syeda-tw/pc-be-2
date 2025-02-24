export async function geoapifyValidateAddress(address: string) {
  var requestOptions = {
    method: "GET",
  };
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${process.env.GEOAPIFY_API_KEY}`,
      requestOptions
    );

    const result = await response.json();

    // Log the result to verify its structure

    // Check if result exists
    if (!result) {
      return {
        isValid: null,
        isOutsideUS: null,
        isComplete: null,
        message: "Address is not valid. Please enter a valid address.",
        isError: true,
      };
    }

    // Check if features array exists in result
    if (!result.features || !Array.isArray(result.features)) {
      return {
        isValid: null,
        isOutsideUS: null,
        isComplete: null,
        message: "Address is not valid. Please enter a valid address.",
        isError: true,
      };
    }

    // Find the feature with the highest rank.confidence
    const highestRankedFeature = result.features.reduce(
      (prev: any, current: any) => {
        return Number(current.properties.rank?.confidence) >
          Number(prev.properties.rank?.confidence)
          ? current
          : prev;
      }
    );
    const isValid = highestRankedFeature.properties.rank?.confidence > 0.8;

    if (!isValid) {
      return {
        isValid: false,
        isOutsideUS: null,
        isComplete: null,
        message: "Address is not valid. Please enter a valid address.",
        isError: true,
      };
    }

    const isOutsideUS =
      highestRankedFeature.properties?.country !== "United States";

    if (isOutsideUS) {
      return {
        isValid: true,
        isOutsideUS: true,
        isComplete: null,
        message:
          "Address is not valid. Please enter an Address in the United States.",
        isError: true,
      };
    }

    const requiredFields = [
      "housenumber",
      "street",
      "city",
      "state",
      "postcode",
      "country",
    ];
    const isComplete = requiredFields.every(
      (field) => highestRankedFeature.properties[field]
    );

    if (!isComplete) {
      return {
        isValid: true,
        isOutsideUS: false,
        isComplete: false,
        message: "Address is not complete. Please enter a complete address.",
        isError: true,
      };
    }

    return {
      isValid: true,
      isOutsideUS: false,
      isComplete: true,
      isError: false,
    };
  } catch (error) {
    console.log("error", error);
    return { isValid: false, isOutsideUS: false };
  }
}
