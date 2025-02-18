const app = require("./app");
const connectDatabase = require("./db/Database");
const cloudinary = require("cloudinary")

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    console.log(`Shutting down server for handling uncaught exception`);
    process.exit(1);
});

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    const result = require("dotenv").config({ path: "config/.env" });
    if (result.error) {
        console.error("Could not load .env file:", result.error);
        process.exit(1);
    }
}

// Connect DB
connectDatabase();

app.get("/", (req, res) => {
    res.send("Hello world");
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    console.log(`Shutting down server for unhandled promise rejection`);

    server.close(() => {
        process.exit(1);
    });
});

// Graceful shutdown on termination signals
process.on("SIGINT", () => {
    console.log("Received SIGINT. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});

process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});
