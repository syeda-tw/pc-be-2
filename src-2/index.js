import app from "./api/server.js"; // Import the Express app setup

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
