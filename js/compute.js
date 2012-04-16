var nodes = [], links = [], forces = [], oldForces = [], quadtree, width, height;
var theta = .5, coulombConstant = .1, springConstant = .1, damping = .05, timeStep = 1/60, k = 0;

function coulomb(node1, node2) {
	var x = node1["x"] - node2["x"];
	var y = node1["y"] - node2["y"];
	var r = Math.sqrt(x*x + y*y);
	if (r == 0) {return [0,0];};
	
	var force = coulombConstant * ((node1["m"] * node2["m"]) / (r*r));
	
	return [(force * (x/r)), (force * (y/r))];
}

function hooke(node1, node2) {
	var x = node1["x"] - node2["x"];
	var y = node1["y"] - node2["y"];
	var d = Math.sqrt(x*x + y*y);
	var force = - springConstant * d;
	
	return [(force * (x/d)), (force * (y/d))];
}

function attract(node1, node2) {
	var x = node1["x"] - node2["x"];
	var y = node1["y"] - node2["y"];
	var d = Math.sqrt(x*x + y*y);
	return d*d/k;
}

function repel(node1, node2) {
	var x = node1["x"] - node2["x"];
	var y = node1["y"] - node2["y"];
	var d = Math.sqrt(x*x + y*y);
	return k*k/d;
}

function quadtree_build() {
	quadtree = {x:0, y:0, w: width + 10, h: height + 10};
	for (var i=0, l=nodes.length; i < l; i++) {
		quad_insert(nodes[i], quadtree);
	}
	
	prune(quadtree);
	compute_mass(quadtree);
}

function prune(n) {
	if (n && n["a"]) {
		if (!n["a"]["a"] && !n["a"]["val"]) {
			delete n["a"];
		}
		if (!n["b"]["a"] && !n["b"]["val"]) {
			delete n["b"];
		}
		if (!n["c"]["a"] && !n["c"]["val"]) {
			delete n["c"];
		}
		if (!n["d"]["a"] && !n["d"]["val"]) {
			delete n["d"];
		}
		prune(n["a"]);
		prune(n["b"]);
		prune(n["c"]);
		prune(n["d"]);
	}
}

function quad_insert(i, n) {
	if (n["a"]) {
		quad_insert(i, get_child(i, n));
	} else if (n["val"]) {
		var newWidth = n["w"]/2;
		var newHeight = n["h"]/2;
		var offsetX = n["w"]/4;
		var offsetY = n["h"]/4;
		n["a"] = {x: (n["x"]-offsetX), y: (n["y"]+offsetY), w: newWidth, h: newHeight};
		n["b"] = {x: (n["x"]+offsetX), y: (n["y"]+offsetY), w: newWidth, h: newHeight};
		n["c"] = {x: (n["x"]-offsetX), y: (n["y"]-offsetY), w: newWidth, h: newHeight};
		n["d"] = {x: (n["x"]+offsetX), y: (n["y"]-offsetY), w: newWidth, h: newHeight};
		
		var node = n["val"];
		get_child(node, n)["val"] = node;
		
		delete n["val"];
		
		try {
			quad_insert(i, get_child(i, n));
		} catch (e) {
			postMessage({"cmd": "log", "params": {"message": e.toString()}});
		}
	} else {
		n["val"] = i;
	}
}

function get_child(i, n) {
	var newWidth = n["w"]/2;
	var newHeight = n["h"]/2;
	var offsetX = n["w"]/4;
	var offsetY = n["h"]/4;
	
	if (i["x"] >= (n["a"]["x"] - offsetX) && i["x"] < (n["a"]["x"] + offsetX) && i["y"] >= (n["a"]["y"] - offsetY) && i["y"] < (n["a"]["y"] + offsetY)) {
		return n["a"];
	} else if (i["x"] >= (n["b"]["x"] - offsetX) && i["x"] < (n["b"]["x"] + offsetX) && i["y"] >= (n["b"]["y"] - offsetY) && i["y"] < (n["b"]["y"] + offsetY)) {
		return n["b"];
	} else if (i["x"] >= (n["c"]["x"] - offsetX) && i["x"] < (n["c"]["x"] + offsetX) && i["y"] >= (n["c"]["y"] - offsetY) && i["y"] < (n["c"]["y"] + offsetY)) {
		return n["c"];
	} else {
		return n["d"];
	}
}

function compute_mass(n) {
	if (n && n["val"]) {
		node = n["val"];
		n["m"] = node["m"];
		n["cm"] = [node["x"], node["y"]];
		return [n["m"], n["cm"]];
	} else if (n) {
		var amass = compute_mass(n["a"]);
		var bmass = compute_mass(n["b"]);
		var cmass = compute_mass(n["c"]);
		var dmass = compute_mass(n["d"]);
		
		var mass = amass[0] + bmass[0] + cmass[0] + dmass[0];
		var cm = vector_add([amass[0]*amass[1][0], amass[0]*amass[1][1]], [bmass[0]*bmass[1][0], bmass[0]*bmass[1][1]], [cmass[0]*cmass[1][0], cmass[0]*cmass[1][1]], [dmass[0]*dmass[1][0], dmass[0]*dmass[1][1]]);
		cm = [cm[0] / mass, cm[1] / mass];
		n["m"] = mass;
		n["cm"] = cm;
		return [mass, cm];
	} else {
		return [0, [0, 0]];
	}
}

function vector_add() {
	var vectorLength = arguments[0].length;
	var out = [];
	for (var i=0; i < vectorLength; i++) {
		var sum = 0;
		for (var j=0, l=arguments.length; j < l; j++) {
			sum += arguments[j][i];
		}
		out.push(sum);
	}
	return out;
}

function tree_force(i, node) {
	var particle = nodes[i];
	if (node["val"]) {
		var force = coulomb(particle, node["val"]);
		forces[i] = vector_add(forces[i], force);
	} else {
		var r = Math.sqrt(Math.pow((particle["x"] - node["cm"][0]), 2) + Math.pow((particle["y"] - node["cm"][1]), 2));
		var D = node["w"];
		if (D / r < theta) {
			var tmpnode = {x: node["cm"][0], y: node["cm"][1], m: node["m"]};
			var force = coulomb(particle, tmpnode);
			forces[i] = vector_add(forces[i], force);
		} else {
			if (node["a"]) { tree_force(i, node["a"]); }
			if (node["b"]) { tree_force(i, node["b"]); }
			if (node["c"]) { tree_force(i, node["c"]); }
			if (node["d"]) { tree_force(i, node["d"]); }
		}
	}
}

function init(params) {
	for (var key in params) {
		this[key] = params[key];
	}
	start();
}

function start() {
	k = Math.sqrt(width*height/nodes.length);
	for (var i=0, l=nodes.length; i < l; i++) {
		oldForces[i] = [0,0];
		forces[i] = [0,0];
	}
	timer = setTimeout(function(){tick()}, 0);
}

function tick() {
	var start = (new Date()).getTime();
	
	//Build the quadtree
	quadtree_build();
	
	//Loop through the nodes and compute the force on each node
	for (var i=0, l=nodes.length; i < l; i++) {
		var node = nodes[i];
		var oldF = oldForces[i];
		var mass = node['m'];
		node['vx'] = node['vx'] + (oldF[0] * timeStep) / (2 * mass);
		node['vy'] = node['vy'] + (oldF[1] * timeStep) / (2 * mass);
		
		node['x'] = node['x'] + (node['vx'] * timeStep);
		node['y'] = node['y'] + (node['vy'] * timeStep);
		
		if (i == this.selectedNode || nodes[i]["t"] == "search") {continue; };
		tree_force(i, quadtree);
	}
	
	//Delete the quadtree
	delete quadtree;
	
	//Calculate the forces on each of the nodes from the springs
	for (var i=0, l=links.length; i < l; i++) {
		var link = links[i];
		var nodeA = link["a"];
		var nodeB = link["b"];
		if (nodeA !== this.selectedNode && nodes[nodeA]["t"] !== "search") {
			forces[nodeA] = vector_add(forces[nodeA], hooke(nodes[nodeA], nodes[nodeB]));
		}
		if (nodeB !== this.selectedNode && nodes[nodeB]["t"] !== "search") {
			forces[nodeB] = vector_add(forces[nodeB], hooke(nodes[nodeB], nodes[nodeA]));
		}
	}

	var entropy = 0;
	var maxX = width / 2;
	var maxY = height / 2;
	//Use the forces to calculate the velocity/position of the nodes
	for (var i=0, l=nodes.length; i < l; i++) {
		var node = nodes[i];
		//var oldF = oldForces[i];
		var net = forces[i];
		var mass = node['m'];
		
		//var vx = node['vx'] + (oldF[0] * timeStep) / (2 * mass);
		//var vy = node['vy'] + (oldF[1] * timeStep) / (2 * mass);
		
		//node['x'] = node['x'] + (vx * timeStep);
		//node['y'] = node['y'] + (vy * timeStep);
		
		node['vx'] = node['vx'] + (net[0] * timeStep) / (2 * mass);
		node['vy'] = node['vy'] + (net[1] * timeStep) / (2 * mass);
		
		oldForces[i] = [net[0], net[1]];
		
		entropy += Math.abs(node['vx']/(l*2)) + Math.abs(node['vy']/(l*2));
		
		/*
		// Calculate node velocity
		node["vx"] = (node["vx"] + (timeStep * net[0])) * damping;
		node["vy"] = (node["vy"] + (timeStep * net[1])) * damping;
		
		entropy += Math.abs(node['vx']/(l*2)) + Math.abs(node['vy']/(l*2));
		
		// Calculate node position
		node["x"] = node["x"] + (timeStep * node["vx"]);
		if (node["x"] > maxX || node["x"] < -maxX) {
			this.width = Math.abs(node["x"]) * 2;
		}
		
		node["y"] = node["y"] + (timeStep * node["vy"]);
		if (node["y"] > maxY || node["y"] < -maxY) {
			this.height = Math.abs(node["y"]) * 2;
		}
		*/
	}
	
	postMessage({"cmd": "update", "params": {"nodes": nodes, "links": links}});
	
	if (entropy > 0) {
		var wait = this.interval - ((new Date()).getTime() - start);
		this.timer = setTimeout(function(){tick();}, wait);
	}
}

addEventListener('message', function(evt){
	self[evt.data['cmd']](evt.data['params']);
}, false);