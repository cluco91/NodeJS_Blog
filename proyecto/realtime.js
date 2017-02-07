module.exports = function(server, sessionMiddleware){
	var io = require("socket.io")(server);//server es el argumento
	var redis = require("redis");

	var client = redis.createClient();

	//Para suscribirse a un canal
	client.subscribe("images");

	io.use(function(socket,next){
		sessionMiddleware(socket.request,socket.request.res,next);
	});

	//Una vez que nos suscribimos a un canal
	client.on("message", function(channel,message){
		//Podemos estar suscritos a multiples canales
		if(channel=="images"){
			//Envia mensaje a todos los sockets del servidor
			io.emit("new image",message);
		}
	});

	//Cuando se conecta un nuevo cliente a nuestra aplicacion via websocket
	io.sockets.on("connection", function(socket){
		console.log(socket.request.session.user_id);
	})
}