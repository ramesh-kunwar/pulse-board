import http from "http";
import app from "./app.js";
import SERVER_CONFIG from "./common/config/serverConfig.js";
import { initSocket } from "./socket.js";

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Server is running at port: ${SERVER_CONFIG.PORT}`);
});

export { httpServer };
