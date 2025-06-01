import { env } from "../../../../common/config/env.js";

const googleAutocompleteAddress = async (address) => {
  const requestOptions = {
    method: "GET",
  };

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    address
  )}&types=address&components=country:us&key=${env.GOOGLE_MAPS_API_KEY}`;

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
};

export const autocompleteAddressHandler = async (req, res, next) => {
  try {
    const data = await googleAutocompleteAddress(req.body.address);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
