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


let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);

let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if(req.session.usuario) {
        next();
    } else {
        console.log("va a : " + req.session.destino);
        res.redirect("/identificarse");
    }
});

app.use("/canciones/agregar", routerUsuarioSession);
app.use("/publicaciones", routerUsuarioSession);

//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
// Cuidado porque req.params no funciona
// en el router si los params van en la URL.
    gestorBD.obtenerCanciones(
        {_id: mongo.ObjectID(id) }, function (canciones) {
            console.log(canciones[0]);
            if(canciones[0].autor === req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});
//Aplicar routerUsuarioAutor
app.use("/cancion/modificar",routerUsuarioAutor);
app.use("/cancion/eliminar",routerUsuarioAutor);


//routerAudios
let routerAudios = express.Router();
routerAudios.use(function(req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl, '.mp3');
    gestorBD.obtenerCanciones(
        {"_id": mongo.ObjectID(idCancion) }, function (canciones) {
            if(req.session.usuario && canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});

app.use("/audios/", routerAudios);

app.use(express.static("public"));

app.set("port", 8081);
app.set("db", connection_url);
app.set("clave", "abcdefg");
app.set("crypto", crypto);

require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);
require("./routes/rcomentarios.js")(app, swig, gestorBD);
require("./routes/rautores.js")(app, swig);
require("./routes/rfavoritos.js")(app, swig, gestorBD);

app.listen(app.get("port"), function() {
    console.log("Servidor activo");
})
