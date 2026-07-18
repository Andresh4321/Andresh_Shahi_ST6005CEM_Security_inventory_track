import app from './app';
import { connectDB } from './database/db';
import { PORT } from './config';

async function startServer() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => console.log(`Server: http://0.0.0.0:${PORT}`));
}

startServer();