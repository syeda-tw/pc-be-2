import app from "./common/config/server.js";
import "./common/config/db.js";
import { env } from "./common/config/env.js";

const port = env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
