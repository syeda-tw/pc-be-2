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

export async function extractAddressPartsFromGeoapify(address) {
  const requestOptions = {
    method: "GET",
  };

  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    address
  )}&format=json&apiKey=${process.env.GEOAPIFY_API_KEY}`;

  const response = await fetch(url, requestOptions);
  const result = await response.json();

  if (!result.results || result.results.length === 0) {
    return null;
  }

  const location = result.results[0]; // Take the best match

  return {
    street: location.street || "",
    city: location.city || location.town || location.village || "",
    state: location.state || "",
    zip: location.postcode || "",
  };
}



export async function googleAutocompleteAddress(address) {
  const requestOptions = {
    method: "GET",
  };

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    address
  )}&types=address&components=country:us&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url, requestOptions);
    console.log(response);
    const result = await response.json();
    console.log(result);

    if (!result.predictions || result.predictions.length === 0) {
      return [];
    }

    return result.predictions.map((prediction) => prediction.description);
  } catch (error) {
    console.error("Error fetching Google autocomplete address:", error);
    return [];
  }
}
