var User = require("../models/user").User;

//La funcion recibe la solicitud, la respuesta y el siguiente middleware a ejecutar
module.exports = function(req, res, next){//Recibe objeto de solicitud, objeto de respuesta y funcion que representa el siguiente middleware
	//Primero validamos que tenemos una sesion y que en esta tenemos un user_id
	//En el caso en que no lo tengamos, hacemos una redireccion hacia la ruta que tiene el login
	if (!req.session.user_id){
		res.redirect("/login");
	}else{
		User.findById(req.session.user_id, function(err, user){//segundo parametro es un callback que se ejecuta cuando ya encontro al usuario
			if(err){
				//En el caso de haber un error lo debe imprimir en la consola y redirecciona a /login
				console.log(err);
				res.redirect("/login");
			}else{
				//Response Locals
				res.locals = { user: user }
				//En caso de no haber error va hacia el middleware siguiente
				next();
			}
		})
	}
}