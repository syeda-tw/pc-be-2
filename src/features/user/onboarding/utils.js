import { env } from "../../../common/config/env.js";

export async function extractAddressPartsFromGoogle(address) {
  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${env.GOOGLE_MAPS_API_KEY}`;

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


// This function is used to remove the password and internal Mongoose properties from the user object
export const sanitizeUser = (user) => {
  // Convert the Mongoose document to a plain JavaScript object, removing Mongoose-specific internal properties
  try {
      const userObject = user?.toObject({ versionKey: false }); // `versionKey: false` removes the `__v` field
      // Destructure to remove the password field
      const { password, ...userWithoutPassword } = userObject;

      // Add type: "user" to the sanitized user object
      const sanitizedUserWithType = { ...userWithoutPassword, type: "user" };

      // Return the sanitized user object with type
      return sanitizedUserWithType;
  } catch (err) {
      return null;
  }
};

