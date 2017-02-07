/*ARCHIVO DE SERVIDOR*/
var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;//Para el modelo User
var session = require("express-session");
var router_app = require("./routes_app");
var session_middleware = require("./middlewares/session");//variable para almacenar el middleware
var formidable = require("express-formidable"); //Para subir archivos a servidor
var RedisStore = require("connect-redis")(session);
var http = require("http");
var realtime = require("./realtime");


//Esto es un middleware para que atributos se puedan sobreescribir
var methodOverride = require("method-override");

var app = express(); 
var server = http.Server(app);

//USA REDIS
var sessionMiddleware = session({
	store: new RedisStore({}),
	secret:"super ultra secret word"		
});

realtime(server, sessionMiddleware)

//MIDDLEWARES
//Archivos Estaticos
app.use("/public", express.static('public'));
app.use(bodyParser.json());//para peticiones application/json
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride("_method"));

/* /app/ */  //-->RUTAS PARA USUARIOS REGISTRADOS
/* /    */   //-->RUTAS PARA USUARIOS NO REGISTRADOS


app.use(sessionMiddleware);

//FORMIDABLE - PARA SUBIR ARCHIVOS A SERVIDOR
app.use(formidable.parse({ keepExtensions: true}));

//Motor de Vistas
app.set("view engine", "jade");

//RUTAS

//ROOT
app.get("/", function(req,res){
	console.log(req.session.user_id);
	res.render("index");
});

//REGISTRO
app.get("/signup", function(req,res){
	User.find(function(err,doc){
		console.log(doc);
		res.render("signup");
	});
}); 

//LOGIN
app.get("/login", function(req,res){
		res.render("login");
}); 

//USERS
app.post("/users", function(req,res){
	var user = new User({
						email: req.body.email, 
						password: req.body.password, 
						password_confirmation: req.body.password_confirmation,
						username: req.body.username,
					});
//Metodo save mediante promises
user.save().then(function(us){
	res.send("Guardamos el usuario exitosamente");
}, function(err){
		console.log(String(err));
		res.send("No pudimos guardar la información.");
	});

});

app.post("/sessions", function(req,res){
User.findOne({email: req.body.email, password: req.body.password},"username email", function(err,user
	){
	req.session.user_id = user._id;
	res.redirect("/app");
  });

});


//Montamos el middleware que acabamos de crear
app.use("/app", session_middleware);

//AQUI MONTAMOS RUTAS EXPORTADAS DE routes_app.js
app.use("/app",router_app);


//En lugar de ser la aplicacion la que reciba las peticiones, sea el sercidor
//el que las reciba
server.listen(8080);