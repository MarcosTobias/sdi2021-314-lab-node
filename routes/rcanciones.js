module.exports = function (app, swig, gestorBD) {
    app.get("/canciones", function (req, res) {
        let canciones = [{
            "nombre": "Blank space",
            "precio": "1.2"
        }, {
            "nombre": "See you again",
            "precio": "1.3"
        }, {
            "nombre": "Uptown Funk",
            "precio": "1.1"
        }];

        let respuesta = swig.renderFile("views/btienda.html", {
            vendedor: "Tienda de canciones",
            canciones: canciones
        });

        res.send(respuesta);
    });

    app.get("/suma", function (req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);

        res.send(String(respuesta));
    });

    app.get("/canciones/agregar", function (req, res) {
        let respuesta = swig.renderFile("views/bagregar.html", {});

        res.send(respuesta);
    });

    app.get("/canciones/:id", function (req, res) {
        let respuesta = "id: " + req.params.id;
        res.send(respuesta);
    });

    app.get("/canciones/:genero/:id", function (req, res) {
        let respuesta = "id: " + req.params.id + "<br>"
            + "Género: " + req.params.genero;

        res.send(respuesta);
    });

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });


    function paso1ModificarPortada(files, id, callback) {
        if (files && files.portada != null) {
            let imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    }

    function paso2ModificarAudio(files, id, callback) {
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/' + id + '.mp3', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    }

    function compradaOAutor(usuario, id, callback) {
        let criterio = { "usuario": usuario, "cancionId": id };
        gestorBD.obtenerCompras(criterio, function(cancionComprada) {
            if(cancionComprada.length !== 0) {
                callback(true);
            } else {
                let criterio2 = { "autor": usuario, "_id": id };
                gestorBD.obtenerCanciones(criterio2, function(autorCancion) {
                    if(autorCancion.length !== 0) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                });
            }
        });
    }

    app.get("/cancion/:id", function (req, res) {
        let criterio = { "_id": gestorBD.mongo.ObjectID(req.params.id) };
        let comentario_criterio = { "cancion_id": gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.redirect("/error" +
                    "?error=Error al recuperar la canción." +
                    "&tipoError=alert-danger ");
            } else {
                gestorBD.obtenerComentarios(comentario_criterio, function (comentarios) {
                    let comments = comentarios == null ? [] : comentarios;

                    compradaOAutor(req.session.usuario, gestorBD.mongo.ObjectID(req.params.id), function(comprada) {
                        let respuesta = swig.renderFile('views/bcancion.html',
                            {
                                cancion: canciones[0],
                                comentarios: comments,
                                puedeComprar: !comprada
                            });

                        res.send(respuesta);
                    });
                });
            }
        });
    })

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = { "_id": gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion: canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);

        compradaOAutor(req.session.usuario, cancionId, function(comprada) {
            if(comprada.length === 0) {
                let compra = {
                    usuario: req.session.usuario,
                    cancionId: cancionId
                }
                gestorBD.insertarCompra(compra, function (idCompra) {
                    if (idCompra == null) {
                        res.send(respuesta);
                    } else {
                        res.redirect("/compras");
                    }
                });
            } else {
                res.redirect("/error" +
                    "?error=No puedes comprar una canción tuya o que ya hayas comprado" +
                    "&tipoError=alert-danger ");
            }
        })
    });


    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                res.redirect("/error" +
                    "?error=Error al modificar." +
                    "&tipoError=alert-danger ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if (result == null) {
                        res.redirect("/error" +
                            "?error=Error en la modificación" +
                            "&tipoError=alert-danger ");
                    } else {
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    });

    app.post("/cancion", function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/tienda");
            return;
        }

        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: req.session.usuario,
        };

        // Conectarse
        gestorBD.insertarCancion(cancion, function (id) {
            if (req.files.portada != null) {
                let imagen = req.files.portada;
                imagen.mv('public/portadas/' + id + '.png', function (err) {
                    if (err) {
                        res.redirect("/error" +
                            "?error=Error al subir la portada." +
                            "&tipoError=alert-danger ");
                    } else {
                        if (req.files.audio != null) {
                            let audio = req.files.audio;
                            audio.mv('public/audios/' + id + '.mp3', function (err) {
                                if (err) {
                                    res.redirect("/error" +
                                        "?error=Error al subir el audio." +
                                        "&tipoError=alert-danger ");
                                } else {
                                    res.redirect("/publicaciones");
                                }
                            });
                        }
                    }
                });
            }
        });
    });

    app.get("/promo*", function (req, res) {
        res.send("Respuesta patrón promo* ");
    });

    app.get("/tienda", function (req, res) {
        let criterio = {};

        if (req.query.busqueda != null) {
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda}};
        }

        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerCancionesPg(criterio, pg, function (canciones, total) {
            if (canciones == null) {
                res.redirect("/error" +
                    "?error=Error al listar." +
                    "&tipoError=alert-danger ");
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: canciones,
                        paginas: paginas,
                        actual: pg
                    });
                res.send(respuesta);
            }
        });

    });

    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.redirect("/error" +
                    "?error=Error al listar." +
                    "&tipoError=alert-danger ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        canciones: canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.get("/compras", function (req, res) {
        let criterio = {"usuario": req.session.usuario};

        gestorBD.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                res.redirect("/error" +
                    "?error=Error al listar." +
                    "&tipoError=alert-danger ");
            } else {
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }

                let criterio = {"_id": {$in: cancionesCompradasIds}};
                gestorBD.obtenerCanciones(criterio, function (canciones) {
                    let respuesta = swig.renderFile("views/bcompras.html",
                        {
                            canciones: canciones
                        });
                    res.send(respuesta);
                })
            }
        })
    })
};