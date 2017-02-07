var socket = io();

//Este new image debe coincidir con el message
//new image puesto en realtime.js
socket.on("new image",function(data){

	data = JSON.parse(data);
	var container = document.querySelector("#imagenes");
	console.log(data);

	var source = document.querySelector("#image-template").innerHTML;

	var template = Handlebars.compile(source);

	container.innerHTML += template(data);

});