let express = require("express");
let app = express();

let swig = require("swig");
let mongo = require("mongodb");
let fileUpload = require("express-fileupload");

let crypto = require("crypto");

let expressSession = require("express-session");

app.use(expressSession({
    secret: "abcdefg",
    resave: true,
    saveUninitialized: true
}));


let connection_url = "mongodb://admin:verySecurePassword@tiendamusica-shard-00-00.ce5h9.mongodb.net:27017,tiendamusica-shard-00-01.ce5h9.mongodb.net:27017,tiendamusica-shard-00-02.ce5h9.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-o11010-shard-0&authSource=admin&retryWrites=true&w=majority";

let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());

app.use(express.static("public"));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);

app.set("port", 8081);
app.set("db", connection_url);
app.set("clave", "abcdefg");
app.set("crypto", crypto);

require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig);

app.listen(app.get("port"), function() {
    console.log("Servidor activo");
})
