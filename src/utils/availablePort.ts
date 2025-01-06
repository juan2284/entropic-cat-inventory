import net, { AddressInfo } from 'node:net';

export function findAvailablePort (desiredPort: number) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(desiredPort, () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => {
        resolve(port);
      });
    });

    server.on('error', (err) => {
      if (err.message.includes('EADDRINUSE')) {
        findAvailablePort(0).then(port => resolve(port));
      } else {
        reject(err);
      }
    });
  });
}