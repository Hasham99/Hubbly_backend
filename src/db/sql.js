import postgres from 'postgres'
import dotenv from "dotenv";    // Import your Supabase client

// Load environment variables from the .env file
dotenv.config({
    path: './.env'
});

const connectionString = process.env.DATABASE_URL

const sql = postgres(connectionString)

export default sql