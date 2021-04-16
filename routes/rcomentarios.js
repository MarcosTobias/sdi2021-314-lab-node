module.exports = function (app, swig, gestorBD) {
    app.post("/comentarios/:id_cancion", function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/identificarse");
            return;
        }

        let comentario = {
            autor: req.session.usuario,
            texto: req.body.texto,
            cancion_id: gestorBD.mongo.ObjectID(req.params.id_cancion),
        };

        gestorBD.insertarComentario(comentario, function (id) {
            if (id == null) {
                req.session.errores = { mensaje: "Error insertando el comentario", tipoMensaje: "text" };
                res.redirect("/error");
            } else {
                res.redirect("/cancion/" + comentario.cancion_id);
            }
        });
    });

    app.get("/comentario/borrar/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerComentarios(criterio, function (comentarios) {
            let cancionId = comentarios[0].cancion_id;

            if(req.session.usuario != comentarios[0].autor) {
                req.session.errores = {
                    mensaje: "No se puede borrar un comentario que no es tuyo",
                    tipoMensaje: "text"
                };
                res.redirect("/error");
            } else {
                gestorBD.borrarComentario(criterio, function (success) {
                    if (success == null) {
                        req.session.errores = { mensaje: "Error borrando el comentario", tipoMensaje: "text" };
                        res.redirect("/error");
                    } else {
                        res.redirect("/cancion/" + cancionId.toString());
                    }
                });
            }
        });
    });
};