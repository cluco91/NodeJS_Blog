var express = require("express");
var Imagen = require("./models/imagenes");//Importamos el modelo imagenes
var router = express.Router();//Factory que nos retorna un objeto Router
var fs = require("fs"); //Va a permitir mover el archivo
var redis = require("redis");

var client = redis.createClient();

var image_finder_middleware = require("./middlewares/find_image");

//RUTA
/* app.com/app/ */
router.get("/", function(req,res){
	/*Por ahora busca todas las imagenes*/
	Imagen.find({})
	.populate("creator")
	.exec(function(err,imagenes){
	if(err) console.log(err);	
	res.render("app/home",{imagenes: imagenes});
	})
});

/* REST */
/* CRUD */

//FORMULARIO DE CREACION DE IMAGENES
router.get("/imagenes/new", function(req,res){
	res.render("app/imagenes/new");
});

//Estas implementaran el middleware
router.all("/imagenes/:id*", image_finder_middleware)

//FORMULARIO DE EDICION DE IMAGEN YA EXISTENTE
router.get("/imagenes/:id/edit", function(req,res){
	res.render("app/imagenes/edit");
});

//IMAGEN INDIVIDUAL
router.route("/imagenes/:id")
	.get(function(req,res){
			res.render("app/imagenes/show");
	})
	.put(function(req,res){
		//Actualiza las imagenes
		res.locals.imagen.title = req.body.title;
		res.locals.imagen.save(function(err){
			if(!err){
			//Si no hay error hacemos render de la vista show
				res.render("app/imagenes/show");
			}else{
			//Si hay error hacemos render del formulario edit
				res.render("app/imagenes/"+req.params.id+"/edit");
			}
		})
	})
	.delete(function(req,res){
	//Eliminar las imagenes
	Imagen.findOneAndRemove({_id:req.params.id},function(err){
		if(!err){
			res.redirect("/app/imagenes");
		}else{
			console.log(err);
			res.redirect("/app/imagenes"+req.params.id);
		}
	})

});

//COLECCION DE IMAGENES
router.route("/imagenes")
	.get(function(req,res){
		//Devolver solo las imagenes donde 
		Imagen.find({creator: res.locals.user._id},function(err,imagenes){
			if(err){ res.redirect("/app"); return; }
			res.render("app/imagenes/index", {imagenes: imagenes})
		});
	})
	.post(function(req,res){
		var extension = req.body.archivo.name.split(".").pop();
		//pop() extrae el ultimo elemento del arreglo, que corresponde a la extension del archivo
		var data = {
			title: req.body.title,//title es de imagenes.js
			creator: res.locals.user._id,//creator es de imagenes.js
			extension: extension
		}
		var imagen = new Imagen(data);
		imagen.save(function(err){
			if(!err){

				var imgJSON = {
					"id": imagen._id,
					"title": imagen.title,
					"extension": imagen.extension
				}

				client.publish("images",JSON.stringify(imgJSON));
				fs.rename(req.body.archivo.path, "public/imagenes/"+imagen._id+"."+extension);
				res.redirect("/app/imagenes/"+imagen._id);
			}else{
				console.log(imagen);
				res.render(err);
			}
		});
	
	});

module.exports = router;