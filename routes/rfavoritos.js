module.exports = function (app, swig, gestorDB) {
    app.get("/favoritos/add/:cancion_id", function (req, res) {
        let criterio = {"_id": gestorDB.mongo.ObjectID(req.params.cancion_id)};
        gestorDB.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                req.session.errores = { mensaje: "Error al recuperar la canción", tipoMensaje: "text" };
                res.redirect("/error");
            } else {
                let cancion = canciones[0];

                if (req.session.favoritos == null)
                    req.session.favoritos = [];

                if (req.session.favoritos.length == 0 || req.session.favoritos.filter(x => x._id === cancion._id.toString()).length == 0) {
                    req.session.favoritos.push({
                        _id: cancion._id,
                        nombre: cancion.nombre,
                        genero: cancion.genero,
                        precio: cancion.precio,
                        autor: cancion.autor
                    });
                }

                res.redirect("/favoritos");
            }
        });
    });

    app.get("/favoritos", function (req, res) {
        let total = req.session.favoritos.map(x => parseInt(x.precio)).reduce((accumulator, current) => accumulator + current);
        let respuesta = swig.renderFile('views/bfavoritos.html',
            {
                favoritos: req.session.favoritos,
                total: total,
                errores: req.session.errores
            });

        req.session.errores = { mensaje: "", tipoMensaje: "" };

        res.send(respuesta);
    });

    app.get("/favoritos/eliminar/:cancion_id", function (req, res) {
        req.session.favoritos = req.session.favoritos.filter(x => x._id !== req.params.cancion_id);

        let total;

        if (req.session.favoritos.length == 0)
            total = 0;
        else
            total = req.session.favoritos.map(x => parseInt(x.precio)).reduce((accumulator, current) => accumulator + current);

        let respuesta = swig.renderFile('views/bfavoritos.html',
            {
                favoritos: req.session.favoritos,
                total: total,
                errores: req.session.errores
            });

        req.session.errores = { mensaje: "", tipoMensaje: "" };

        res.send(respuesta);
    });
}