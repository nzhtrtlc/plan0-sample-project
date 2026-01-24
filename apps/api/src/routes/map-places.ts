import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  const { input } = req.query;

  if (typeof input !== "string") {
    return res.status(400).json({
      error: "Query parameter 'input' is required and must be a string.",
    });
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  );
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY as string;

  url.searchParams.append("input", input);
  url.searchParams.append("key", API_KEY);
  url.searchParams.append("types", "address");

  const response = await fetch(url.toString());

  if (!response.ok) {
    console.error(
      `Google Places API HTTP error: ${response.status} ${response.statusText}`
    );
    return res.status(502).json({
      error: "Failed to fetch suggestions from Google Places API",
    });
  }

  const data = await response.json();

  res.json(data);
});

export default router;
