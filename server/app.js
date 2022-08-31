
require("dotenv").config();
const express = require("express");
const path = require('path')
const indexRouter = require("./routes/index");
const apiResponse = require("./helpers/apiResponse");

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const logger = require("morgan");
const cors = require("cors");

// DB connection
const MONGODB_URL = process.env.MONGODB_URL;
const mongoose = require("mongoose");

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	//don't show the log when it is test
	if (process.env.NODE_ENV !== "test") {
		console.log("Connected to %s", MONGODB_URL);
		console.log("App is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	}
})
	.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});

mongoose.set('debug', true)
const db = mongoose.connection;

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
	app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
//To allow cross-origin requests
app.use(cors());
app.use("/", indexRouter);

// throw 404 if URL not found
app.all("*", function (req, res) {
	return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
	if (err.name === "UnauthorizedError") {
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

  

module.exports = app;
