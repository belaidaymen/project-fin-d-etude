process.env.NEXT_PRIVATE_WORKER = '1';
process.env.__NEXT_DEV_SERVER = '1';

const { startServer } = require('./node_modules/next/dist/server/lib/start-server');

const port = parseInt(process.env.PORT || '5000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';

startServer({
  dir: __dirname,
  port,
  isDev: true,
  hostname,
  allowRetry: false,
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
