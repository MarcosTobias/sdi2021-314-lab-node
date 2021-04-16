module.exports = function (app, swig, gestorBD) {
    app.get("/usuarios", function (req, res) {
        res.send("ver usuarios");
    });

    app.get("/registrarse", function (req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {
            errores: req.session.errores
        });

        req.session.errores = { mensaje: "", tipoMensaje: "" };

        res.send(respuesta);
    });

    app.post('/usuario', function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email: req.body.email,
            password: seguro
        };

        gestorBD.insertarUsuario(usuario, function (id) {
            if (id == null) {
                req.session.errores = { mensaje: "Error al registrar usuario", tipoMensaje: "alert-danger" };
                res.redirect("/registrarse");
            } else {
                req.session.errores = { mensaje: "Nuevo usuario registrado", tipoMensaje: "alert-success" };
                res.redirect("/identificarse");
            }
        });
    });

    app.get("/identificarse", function (req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {
            errores: req.session.errores
        });

        req.session.errores = {mensaje: "", tipoMensaje: "" };

        res.send(respuesta);
    });

    app.post("/identificarse", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                req.session.errores = { mensaje: "Email o password incorrecto", tipoMensaje: "alert-danger" };
                res.redirect("/identificarse");
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.errores = { mensaje: "", tipoMensaje: ""};
                res.redirect("/publicaciones");
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.send("Usuario desconectado");
    });

    app.get("/error", function(req, res) {
        let response = swig.renderFile("views/error.html", {
            errores: req.session.errores
        });

        req.session.errores = { mensaje: "", tipoMensaje: "" };

        res.send(response);
    });
};