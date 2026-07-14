import app from './app';
import { connectDB } from './database/db';
import { PORT } from './config';

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}

startServer();