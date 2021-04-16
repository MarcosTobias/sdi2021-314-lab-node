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
                res.redirect("/error" +
                    "?error=Error insertando el comentario." +
                    "&tipoError=alert-danger ");
            } else {
                res.redirect("/cancion/" + comentario.cancion_id);
            }
        });
    });

    app.get("/comentario/borrar/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerComentarios(criterio, function (comentarios) {
            let cancionId = comentarios[0].cancion_id;

            if(req.session.usuario != comentarios[0].autor)
                res.redirect("/error" +
                    "?error=No se puede borrar un comentario que no es tuyo." +
                    "&tipoError=alert-danger ");
            else {
                gestorBD.borrarComentario(criterio, function (success) {
                    if (success == null) {
                        res.redirect("/error" +
                            "?error=Error borrando el comentario." +
                            "&tipoError=alert-danger ");
                    } else {
                        res.redirect("/cancion/" + cancionId.toString());
                    }
                });
            }
        });
    });
};