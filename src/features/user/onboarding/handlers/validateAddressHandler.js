import { env } from "../../../../common/config/env.js";

export async function googleValidateAddress(address) {
  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${env.GOOGLE_MAPS_API_KEY}`;

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



export const validateAddressHandler = async (req, res, next) => {
  try {
    const data = await googleValidateAddress(req.body.data.address);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
