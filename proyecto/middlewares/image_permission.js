var Imagen = require("../models/imagenes");

module.exports = function(imagen,req,res){
	//True = Tienes Permisos
	//False = Si no tienenes permisos
	//Si la peticion es GET y no contiene edit, el retorno sera true
	if(req.method === "GET" && req.path.indexOf("edit" ) < 0){
		//Ver la imagen
		return true;
	}

	if(typeof imagen.creator == "undefined"){
		return false;
	}

	if (imagen.creator._id.toString() == res.locals.user._id){
		//Esta imagen yo la subi
		return true;
	}

	return false;

}