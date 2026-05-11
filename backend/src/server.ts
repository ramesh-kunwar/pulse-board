import app from "./app.js";
import SERVER_CONFIG from "./common/config/serverConfig.js";

app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Server is running at prot: ${SERVER_CONFIG.PORT}`);
});
