import { app } from "./app.js";
import dotenv from "dotenv";
import connectDb from "./db/index.js"
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config({
    path: './.env'
})
// const server = createServer(app); // Create raw HTTP server
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
//   }
// });

// // Handle incoming socket connections
// io.on("connection", (socket) => {
//   console.log(`🔌 New socket connected: ${socket.id}`);
//   handleSocketConnection(socket, io); // custom logic for matchmaking
// });

connectDb().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Database Connected & ⚙️ Server running on Port: ${process.env.PORT} `);
    })
}).catch((error) => { console.log(`DB connection error server.js: ${error} `); });

// import { app } from "./app.js";  
// import dotenv from "dotenv";   
// import sql  from "./db/sql.js";

// // Load environment variables from the .env file
// dotenv.config({
//     path: './.env'
// });
// // Function to check the connection to the PostgreSQL database using the postgres client
// const checkPostgresConnection = async () => {
//     try {
//         // Test the connection by querying a simple SQL query (e.g., SELECT NOW() for current timestamp)
//         const result = await sql`SELECT NOW()`;
//         console.log('Connected to Supabase PostgreSQL database successfully!', result[0]);
//     } catch (err) {
//         console.error('Error connecting to Supabase PostgreSQL:', err.message);
//         process.exit(1);  // Exit the process if database connection fails
//     }
// };

// // Step 2: Connect to Supabase PostgreSQL and then start the server
// checkPostgresConnection().then(() => {
//     // Step 3: Only start the Express server if the connection to the database is successful
//     app.listen(process.env.PORT, () => {
//         console.log(`⚙️ Server running on Port: ${process.env.PORT}`);
//     });
// }).catch((error) => {
//     console.log(`Failed to start server due to PostgreSQL connection error: ${error}`);
//     process.exit(1);  // Exit the process if database connection fails
// });