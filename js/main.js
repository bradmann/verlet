if (typeof Object.create !== 'function') {
	Object.create = function (o, props) {
		function F() {}
		F.prototype = o;
		var tmp = new F();
		if (props) {
			for (var key in props) {
				if (props.hasOwnProperty(key)) {
					tmp[key] = props[key];
				}
			}
		}
		return tmp;
	};
}

$(function(){
	var canvas = $('#canvas')[0];
	var nodes = [], links = [];
	nodes.push({'r': [0,0], 'v': [0,0], 'c': '#666666', 'm': 10, 'data': '', 'text': 'fruchterman-reingold'});
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 10, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 10, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 10, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#0000FF', 'm': 10, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 10, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': 10, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 10, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': 10, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 10, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': 10, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 10, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': 10, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 10, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': 10, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	for (var i=2; i < 21; i++) {
		links.push({'a': 1, 'b': i});
	}
	for (var i=22; i < 41; i++) {
		links.push({'a': 21, 'b': i});
	}
	for (var i=42; i < 61; i++) {
		links.push({'a': 41, 'b': i});
	}
	for (var i=62; i < 81; i++) {
		links.push({'a': 61, 'b': i});
	}
	for (var i=82; i < 101; i++) {
		links.push({'a': 81, 'b': i});
	}
	for (var i=102; i < 121; i++) {
		links.push({'a': 101, 'b': i});
	}
	for (var i=122; i < 141; i++) {
		links.push({'a': 121, 'b': i});
	}
	links.push({'a': 0, 'b': 1});
	links.push({'a': 0, 'b': 21});
	links.push({'a': 0, 'b': 41});
	links.push({'a': 0, 'b': 61});
	links.push({'a': 0, 'b': 81});
	links.push({'a': 0, 'b': 101});
	links.push({'a': 0, 'b': 121});
	NEV.init(canvas, 60);
	NEV.loadGraph(nodes, links);
})