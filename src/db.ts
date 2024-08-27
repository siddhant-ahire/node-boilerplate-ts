import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkConnection() {
  try {
    // Test the connection by running a simple query or just connecting
    await prisma.$connect();
    console.log('Database connection successful.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    // Optionally, handle specific error scenarios here
    throw error; // Re-throw if you want to propagate the error
  }
}

// Perform connection check before exporting
checkConnection()
  .then(() => {
    // Connection successful, export PrismaClient
  })
  .catch((error) => {
    // Connection failed, handle the error if needed
    console.error('Exiting due to database connection error.');
    process.exit(1); // Exit the process if the connection fails
  });

export default prisma;