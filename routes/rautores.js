module.exports = function(app, swig) {
    app.get("/autores/agregar", function(req, res) {
        let respuesta = swig.renderFile("views/autores-agregar.html", {

        });

        res.send(respuesta);
    });

    app.post("/autor", function(req, res) {
        let nombre = req.body.nombre == "" ? "Nombre no enviado en la petición" : req.body.nombre;
        let grupo = req.body.grupo == "" ? "Grupo no enviado en la petición" : req.body.grupo;
        let rol = req.body.rol == "" ? "Rol no enviado en la petición" : req.body.rol;

        res.send("Autor agregado: " + "<br>" + "Nombre: " + nombre + "<br>"
                        + "Grupo: " + grupo + "<br>" + "Rol: " + rol);
    });
};