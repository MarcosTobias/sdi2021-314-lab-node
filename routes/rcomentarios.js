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
                res.send("Error insertando el comentario");
            } else {
                res.redirect("/cancion/" + comentario.cancion_id);
            }
        });
    });
};