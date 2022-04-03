const express = require("express");
const path = require("path"); 
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const app = express(); // start a server, creates an express app
// The express() function is a top-level function exported by the express module.
dotenv.config();


app.use(express.urlencoded({extended: false })); 
app.use(express.json()); 
app.use(cookieParser());
 

const publicDirectory = path.join(__dirname, './public'); 
console.log("__dirname", __dirname); 
app.use(express.static(publicDirectory));
app.set("view engine", "hbs");

app.use("/", require("./routes/page.js"));
app.use("/auth", require("./routes/auth.js"));


app.listen(12345, () => {
    console.log("Server is listening on port 12345");
})

