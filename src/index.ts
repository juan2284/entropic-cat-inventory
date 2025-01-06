import colors from 'colors';
import server from './server.js';
import { findAvailablePort } from './utils/availablePort.js';

const desiredPort = process.env.PORT || 4000;
const port = await findAvailablePort(Number(desiredPort));

server.listen(port, () => {
  console.log(colors.bgCyan.bold( `REST API funcionando en el puerto ${port}`));
});