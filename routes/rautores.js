module.exports = function(app, swig) {
    app.get("/autores", function(req, res) {
        let autores = [{
            nombre: "CantanteGenerico",
            grupo: "grupoGenerico1",
            rol: "Cantante"
        }, {
            nombre: "BateríaGenerico",
            grupo: "grupoGenerico2",
            rol: "Batería"
        }, {
            nombre: "GuitarristaGenerico",
            grupo: "grupoGenerico3",
            rol: "Guitarrista"
        }, {
            nombre: "BajistaGenerico",
            grupo: "grupoGenerico4",
            rol: "Bajista"
        }, {
            nombre: "TeclistaGenerico",
            grupo: "grupoGenerico5",
            rol: "Teclista"
        }];

        let respuesta = swig.renderFile("views/autores.html", {
            autores: autores,
            errores: req.session.errores
        });

        req.session.errores = { mensaje: "", tipoMensaje: "" };

        res.send(respuesta);
    });

    app.get("/autores/agregar", function(req, res) {
        let roles = [{
            texto: "Cantante"
        }, {
            texto: "Batería"
        }, {
            texto: "Guitarrista"
        }, {
            texto: "Bajista"
        }, {
            texto: "Teclista"
        }];

        let respuesta = swig.renderFile("views/autores-agregar.html", {
            roles: roles,
            errores: req.session.errores
        });

        req.session.errores = { mensaje: "", tipoMensaje: "" };

        res.send(respuesta);
    });

    app.get("/autores/filtrar/:rol", function(req, res) {
        let autores = [{
            nombre: "CantanteGenerico",
            grupo: "grupoGenerico1",
            rol: "Cantante"
        }, {
            nombre: "BateríaGenerico",
            grupo: "grupoGenerico2",
            rol: "Batería"
        }, {
            nombre: "GuitarristaGenerico",
            grupo: "grupoGenerico3",
            rol: "Guitarrista"
        }, {
            nombre: "BajistaGenerico",
            grupo: "grupoGenerico4",
            rol: "Bajista"
        }, {
            nombre: "TeclistaGenerico",
            grupo: "grupoGenerico5",
            rol: "Teclista"
        }];

        autores = autores.filter(autor => autor.rol.toLowerCase()  === req.params.rol.toLowerCase());

        let respuesta = swig.renderFile("views/autores.html", {
            autores: autores,
            errores: req.session.errores
        });

        req.session.errores = { mensaje: "", tipoMensaje: "" };

        res.send(respuesta);
    });

    app.get("/autores*", function(req, res) {
        res.redirect("/autores");
    });

    app.post("/autor", function(req, res) {
        let nombre = req.body.nombre === "" ? "Nombre no enviado en la petición" : req.body.nombre;
        let grupo = req.body.grupo === "" ? "Grupo no enviado en la petición" : req.body.grupo;
        let rol = req.body.rol === "" ? "Rol no enviado en la petición" : req.body.rol;

        res.send("Autor agregado: " + "<br>" + "Nombre: " + nombre + "<br>"
                        + "Grupo: " + grupo + "<br>" + "Rol: " + rol);
    });
};