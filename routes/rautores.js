module.exports = function(app, swig) {
    app.get("/autores/agregar", function(req, res) {
        let respuesta = swig.renderFile("views/autores-agregar.html", {

        });

        res.send(respuesta);
    });
};