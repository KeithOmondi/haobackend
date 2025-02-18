const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URL)
        .then((data) => {
            console.log(`database connection successful: ${data.connection.host}`);
        })
        .catch((error) => {
            console.error("Database connection error:", error.message);
            process.exit(1); // Exit process if the connection fails
        });
};

module.exports = connectDatabase;
