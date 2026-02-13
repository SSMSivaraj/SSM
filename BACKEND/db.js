import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();
  console.log("enetr inti /forms endpoint", process.env.DB_USERNAME, process.env.PASSWORD, process.env.DB_PRIME, process.env.DB_SVSM, process.env.DB_PORT);

const config = {
     port: parseInt(process.env.DB_PORT, 10),
     server: `${process.env.SERVERNAME}`, // Your SQL Server name or IP
    database: `${process.env.DB_SVSM}`, // Your database name

    options: {
        encrypt: false, // Adjust based on your SSL settings
        trustServerCertificate: true, // Allow self-signed certificate
    },
    authentication: {
        type: 'default',
        options: {
            userName: `${process.env.DB_USERNAME}`, // Replace with the login name you created
            password: `${process.env.PASSWORD}`, // Replace with the login password
        },
    },
    requestTimeout: 1000000, // Set timeout to 30 seconds
    connectionTimeout: 1000000, // Set connection timeout to 30 second
    
};

let poolPromise;
export const getPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config).catch(err => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
};

export { sql };
