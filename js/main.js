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
	for (var i=0; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': 5, 'data': ''};
		nodes.push(node);
	}
	for (var i=0; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#0000FF', 'm': 5, 'data': ''};
		nodes.push(node);
	}
	for (var i=0; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': 5, 'data': ''};
		nodes.push(node);
	}
	for (var i=1; i < 20; i++) {
		links.push({'a': 0, 'b': i});
	}
	for (var i=21; i < 40; i++) {
		links.push({'a': 20, 'b': i});
	}
	for (var i=41; i < 60; i++) {
		links.push({'a': 40, 'b': i});
	}
	links.push({'a': 0, 'b': 20});
	links.push({'a': 20, 'b': 40});
	links.push({'a': 0, 'b': 40});
	NEV.init(canvas, 60);
	NEV.loadGraph(nodes, links);
})