export async function extractAddressPartsFromGoogle(address) {
  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const payload = {
    address: {
      addressLines: [address],
    },
    enableUspsCass: true,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  const components = data?.result?.address?.addressComponents;

  if (!components || components.length === 0) {
    return null;
  }

  const getComponent = (type) => {
    const comp = components.find((c) => c.componentType === type);
    return comp?.componentName?.text || "";
  };

  return {
    street: `${getComponent("street_number")} ${getComponent("route")}`.trim(),
    city:
      getComponent("locality") ||
      getComponent("sublocality") ||
      getComponent("administrative_area_level_2") || "",
    state: getComponent("administrative_area_level_1"),
    zip: getComponent("postal_code"),
    country: getComponent("country"),
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
    const result = await response.json();

    if (!result.predictions || result.predictions.length === 0) {
      return [];
    }

    return result.predictions.map((prediction) => prediction.description);
  } catch (error) {
    console.error("Error fetching Google autocomplete address:", error);
    return [];
  }
}

export async function googleValidateAddress(address) {
  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const payload = {
    address: {
      addressLines: [address],
    },
    enableUspsCass: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const result = data?.result;
    const { addressComponents } = result?.address;

    // Step 1: Check if it's in the United States
    const countryComponent = addressComponents.find(
      (component) => component.componentType === "country"
    );

    if (countryComponent?.componentName?.text !== "USA") {
      return {
        isValid: false,
        isOutsideUS: true,
        isComplete: false,
        message: "Address is not in the United States.",
      };
    }

    // Step 2: Check completeness of the address components
    const missingParts = [];

    // Check for Street address
    const street = addressComponents.find(
      (component) => component.componentType === "street_number" && component.confirmationLevel === "CONFIRMED" && component.inferred !== true || component.componentType === "route" && component.confirmationLevel === "CONFIRMED" && component.inferred !== true 
    );
    if (!street) missingParts.push("street address");

    // Check for City
    const city = addressComponents.find(
      (component) => component.componentType === "locality" && component.confirmationLevel === "CONFIRMED" && component.inferred !== true
    );
    if (!city) missingParts.push("city");

    // Check for State
    const state = addressComponents.find(
      (component) => component.componentType === "administrative_area_level_1" && component.confirmationLevel === "CONFIRMED" && component.inferred !== true
    );
    if (!state) missingParts.push("state");

    // // Check for ZIP code
    // const zip = addressComponents.find(
    //   (component) => component.componentType === "postal_code" && component.confirmationLevel === "CONFIRMED" && component.inferred !== true
    // );
    // if (!zip) missingParts.push("ZIP code");

    // Check for Country (already validated above, but we still want to ensure it's part of the response)
    const country = addressComponents.find(
      (component) => component.componentType === "country" && component.confirmationLevel === "CONFIRMED" && component.inferred !== true
    );
    if (!country) missingParts.push("country");

    // If anything is missing, return a message
    if (missingParts.length > 0) {
      return {
        isValid: false,
        isOutsideUS: false,
        isComplete: false,
        message: `Address is incomplete. Missing: ${missingParts.join(", ")}.`,
      };
    }

    // If everything is there
    return {
      isValid: true,
      isOutsideUS: false,
      isComplete: true,
      message: "Address is valid and complete.",
    };
  } catch (error) {
    return {
      isValid: false,
      isOutsideUS: false,
      isComplete: false,
      message: "Something went wrong while validating the address.",
    };
  }
}




