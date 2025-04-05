export async function geoapifyValidateAddress(address) {
  const requestOptions = {
    method: "GET",
  };
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${process.env.GEOAPIFY_API_KEY}`,
      requestOptions
    );

    const result = await response.json();

    // Check if result exists
    if (!result) {
      return {
        isValid: false,
        isOutsideUS: null,
        isComplete: null,
        message: "Address is not valid. Please enter a valid address.",
      };
    }

    // Check if features array exists in result
    if (!result.features || !Array.isArray(result.features)) {
      return {
        isValid: false,
        isOutsideUS: null,
        isComplete: null,
        message: "Address is not valid. Please enter a valid address.",
      };
    }

    // Find the feature with the highest rank confidence
    const highestRankedFeature = result.features.reduce((prev, current) => {
      return Number(current.properties.rank?.confidence) >
        Number(prev.properties.rank?.confidence)
        ? current
        : prev;
    });

    const isValid = highestRankedFeature.properties.rank?.confidence > 0.8;

    if (!isValid) {
      return {
        isValid: false,
        isOutsideUS: null,
        isComplete: null,
        message: "Address is not valid. Please enter a valid address.",
      };
    }

    const isOutsideUS =
      highestRankedFeature.properties?.country !== "United States";

    if (isOutsideUS) {
      return {
        isValid: false,
        isOutsideUS: true,
        isComplete: null,
        message:
          "Address is not valid. Please enter an Address in the United States.",
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
        isValid: false,
        isOutsideUS: false,
        isComplete: false,
        message: "Address is not complete. Please enter a complete address.",
      };
    }
    return {
      isValid: true,
      isOutsideUS: false,
      isComplete: true,
    };
  } catch (error) {
    return { isValid: false, isOutsideUS: false };
  }
}

export async function geoapifyAutocompleteAddress(address) {
  const requestOptions = {
    method: "GET",
  };
  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${address}&apiKey=${process.env.GEOAPIFY_API_KEY}`,
    requestOptions
  );
  const result = await response.json();
  if (result.length <= 0 && result.features.length <= 0) {
    return [];
  }
  return result.features
    .map((item) => {
      if (
        item.properties.country == "United States of America" ||
        item.properties.country == "United States"
      ) {
        return item.properties.formatted;
      }
      return null;
    })
    .filter((item) => item !== null);
}
