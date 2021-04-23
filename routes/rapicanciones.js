module.exports = function (app, gestorBD) {
    app.get("/api/cancion", function (req, res) {
        gestorBD.obtenerCanciones({}, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });

    app.get("/api/cancion/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones[0]));
            }
        });
    });

    app.delete("/api/cancion/:id", function (req, res) {
        let criterio = { "_id": gestorBD.mongo.ObjectID(req.params.id) }
        let criterio2 = { "_id": gestorBD.mongo.ObjectID(req.params.id), "autor": res.usuario }

        gestorBD.obtenerCanciones(criterio2, function (canciones) {
            if (canciones.length === 0) {
                res.status(500);
                res.json({
                    errores: [ "No puedes borrar una canción que no es tuya"]
                })
            } else {
                gestorBD.eliminarCancion(criterio, function (canciones) {
                    if (canciones == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(canciones));
                    }
                });
            }
        })
    });

    app.post("/api/cancion", function (req, res) {
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
        }

        validarDatosCancion(cancion, function(errors) {
            if(errors !== null && errors.length > 0) {
                res.status(403);
                res.json({
                    errores: errors
                })
            } else {
                gestorBD.insertarCancion(cancion, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje: "canción insertada",
                            _id: id
                        })
                    }
                });
            }
        })
    });

    function validarDatosCancion(cancion, funcionCallback) {
        let errors = [];
        if(cancion.nombre === null || typeof cancion.nombre === 'undefined' || cancion.nombre === "")
            errors.push("El nombre de la canción no puede estar vacío");
        if(cancion.genero === null || typeof cancion.genero === 'undefined' || cancion.genero === "")
            errors.push("El genero de la canción no puede estar vacío");
        if(cancion.precio === null || typeof cancion.precio === 'undefined' || cancion.precio === "")
            errors.push("El precio de la canción no puede estar vacío");

        if(errors.length <= 0)
            funcionCallback(null)
        else
            funcionCallback(errors)
    }

    app.put("/api/cancion/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let criterio2 = { "_id": gestorBD.mongo.ObjectID(req.params.id), "autor": res.usuario };

        gestorBD.obtenerCanciones(criterio2, function (canciones) {
            if (canciones.length === 0) {
                res.status(500);
                res.json({
                    errores: [ "No puedes modificar una canción que no es tuya"]
                })
            } else {
                let cancion = {
                    nombre: req.body.nombre,
                    genero: req.body.genero,
                    precio: req.body.precio
                }

                validarDatosCancion(cancion, function(errors) {
                    if(errors !== null && errors.length > 0){
                        res.status(403);
                        res.json({
                            errores: errors
                        })
                    } else {
                        gestorBD.modificarCancion(criterio, cancion, function (result) {
                            if (result == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            } else {
                                res.status(200);
                                res.json({
                                    mensaje: "canción modificada",
                                    _id: req.params.id
                                })
                            }
                        });
                    }
                })
            }
        })
    });

    app.post("/api/autenticar/", function (req, res) {
        let seguro = app.get("crypto").createHmac("sha256", app.get("clave"))
            .update(req.body.password).digest("hex");

        let criterio = {
            email: req.body.email,
            password: seguro
        }

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios === null || usuarios.length === 0) {
                res.status(401);
                res.json({
                    autenticado: false
                });
            } else {
                let token = app.get("jwt").sign(
                    {usuario: criterio.email, tiempo: Date.now() / 1000},
                    "secreto");

                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                })
            }
        })
    })
}