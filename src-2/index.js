import app from "./common/config/server.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
