var nodes = [], links = [], quadtree, width, height, timer;
var theta = 1, coulombConstant = 10, springConstant = .01, damping = .3, timeStep = 1, k = 0, interval = (1/30) * 1000, temperature = 1, maxVel = 30, selectedIdx = -1, steadyState = .1, lowEntropy = 0;

function repel1(node1, node2) {
	var x = node1['r'][0] - node2['r'][0];
	var y = node1['r'][1] - node2['r'][1];
	var r = Math.sqrt(x*x + y*y);
	if (r == 0) {return [0,0];};
	
	var force = coulombConstant * ((node1["m"] * node2["m"]) / (r*r));
	
	return [(force * (x/r)), (force * (y/r))];
}

function attract1(node1, node2) {
	var x = node1['r'][0] - node2['r'][0];
	var y = node1['r'][1] - node2['r'][1];
	var d = Math.sqrt(x*x + y*y);
	var force = -springConstant * d;
	
	return [(force * (x/d)), (force * (y/d))];
}

function attract(n1, n2) {
	var x = n1['r'][0] - n2['r'][0];
	var y = n1['r'][1] - n2['r'][1];
	var d = Math.sqrt(x*x + y*y);
	var f = -d*d/k;
	
	return [f * (x/d), f * (y/d)];
}

function repel(n1, n2) {
	var x = n1['r'][0] - n2['r'][0];
	var y = n1['r'][1] - n2['r'][1];
	var m1 = n1['m'];
	var m2 = n2['m'];
	var d = Math.sqrt(x*x + y*y);
	if (d === 0) {return [0,0];}
	var f = k*k*(m1 + m2)/d;
	
	return [f * (x/d), f * (y/d)];
}

function fAttract(dist) {
	return -dist*dist/k;
}

function fRepel(dist) {
	if (dist == 0) {return 0;}
	return k*k/dist;
}

function quadtree_build() {
	quadtree = {'r': [0,0], 'w': width + 10, 'h': height + 10};
	for (var i=0, l=nodes.length; i < l; i++) {
		var node = nodes[i];
		quad_insert(node, quadtree);
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
		var pos = n['r'];
		n["a"] = {'r': [(pos[0]-offsetX), (pos[1]+offsetY)], 'w': newWidth, 'h': newHeight};
		n["b"] = {'r': [(pos[0]+offsetX), (pos[1]+offsetY)], 'w': newWidth, 'h': newHeight};
		n["c"] = {'r': [(pos[0]-offsetX), (pos[1]-offsetY)], 'w': newWidth, 'h': newHeight};
		n["d"] = {'r': [(pos[0]+offsetX), (pos[1]-offsetY)], 'w': newWidth, 'h': newHeight};
		
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

function get_child(node, root) {
	var newWidth = root["w"]/2;
	var newHeight = root["h"]/2;
	var offsetX = root["w"]/4;
	var offsetY = root["h"]/4;
	
	var pos = node['r'];
	var a = root['a']['r'], b = root['b']['r'], c = root['c']['r'];
	if (pos[0] >= (a[0] - offsetX) && pos[0] < (a[0] + offsetX) && pos[1] >= (a[1] - offsetY) && pos[1] < (a[1] + offsetY)) {
		return root['a'];
	} else if (pos[0] >= (b[0] - offsetX) && pos[0] < (b[0] + offsetX) && pos[1] >= (b[1] - offsetY) && pos[1] < (b[1] + offsetY)) {
		return root['b'];
	} else if (pos[0] >= (c[0] - offsetX) && pos[0] < (c[0] + offsetX) && pos[1] >= (c[1] - offsetY) && pos[1] < (c[1] + offsetY)) {
		return root['c'];
	} else {
		return root['d'];
	}
}

function compute_mass(n) {
	if (n && n["val"]) {
		var node = n['val'];
		var pos = node['r'];
		n["m"] = node["m"];
		n["cm"] = [pos[0], pos[1]];
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
	var out = new Array(vectorLength);
	for (var i=0; i < vectorLength; i++) {
		var sum = 0;
		for (var j=0, l=arguments.length; j < l; j++) {
			sum += arguments[j][i];
		}
		out[i] = sum;
	}
	return out;
}

function distance(n1, n2) {
	var xDist = n1[0] - n2[0];
	var yDist = n1[1] - n2[1];
	return Math.sqrt(xDist*xDist + yDist*yDist);
}

function tree_force(node, root) {
	if (root['val']) {
		var force = repel(node, root['val']);
		node['f'] = vector_add(node['f'], force);
	} else {
		var r = distance(node['r'], root['cm']);
		var D = root['w'];
		if (D / r < theta) {
			var tmproot = {'r': [root['cm'][0], root['cm'][1]], 'm': root['m']};
			var force = repel(node, tmproot);
			node['f'] = vector_add(node['f'], force);
		} else {
			if (root['a']) { tree_force(node, root['a']); }
			if (root['b']) { tree_force(node, root['b']); }
			if (root['c']) { tree_force(node, root['c']); }
			if (root['d']) { tree_force(node, root['d']); }
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
	k = Math.sqrt(width*height/nodes.length) / 8;
	//Initialize forces to 0
	for (var i=0, l=nodes.length; i < l; i++) {
		nodes[i]['f'] = [0,0];
	}
	timer = setTimeout(function(){tick()}, 0);
}

function compute_force2() {
	//Loop through the nodes and compute the force on each node
	for (var i=0, l=nodes.length; i < l; i++) {
		if (i == this.selectedNode) {continue; };
		var node1 = nodes[i];
		node1['f'] = [0,0];
		for (var j=0; j < l; j++) {
			var node2 = nodes[j];
			node1['f'] = vector_add(node1['f'], repel(node1, node2));
		}
	}
	
	//Calculate the forces on each of the nodes from the springs
	for (var i=0, l=links.length; i < l; i++) {
		var link = links[i];
		var nodeA = nodes[link["a"]];
		var nodeB = nodes[link["b"]];
		if (nodeA !== this.selectedNode) {
			nodeA['f'] = vector_add(nodeA['f'], attract(nodeA, nodeB));
		}
		if (nodeB !== this.selectedNode) {
			nodeB['f'] = vector_add(nodeB['f'], attract(nodeB, nodeA));
		}
	}
}

function compute_force() {
	//Build the quadtree
	quadtree_build();

	//Loop through the nodes and compute the force on each node
	for (var i=0, l=nodes.length; i < l; i++) {
		//if (i == this.selectedNode || nodes[i]["t"] == "search") {continue; };
		var node = nodes[i];
		node['f'] = [0,0];
		if (node['fixed']) {continue;}
		tree_force(node, quadtree);
	}
	
	//Delete the quadtree
	delete quadtree;
	
	//Calculate the forces on each of the nodes from the springs
	for (var i=0, l=links.length; i < l; i++) {
		var link = links[i];
		var nodeA = nodes[link['a']];
		var nodeB = nodes[link['b']];
		if (!nodeA['fixed']) {
			nodeA['f'] = vector_add(nodeA['f'], attract(nodeA, nodeB));
		}
		if (!nodeB['fixed']) {
			nodeB['f'] = vector_add(nodeB['f'], attract(nodeB, nodeA));
		}
	}
}

function min(v1, v2) {
	var d1 = Math.sqrt(v1[0]*v1[0] + v1[1]*v1[1]);
	var d2 = Math.sqrt(v2[0]*v2[0] + v2[1]*v2[1]);
	if (d1 < d2) {
		return v1; 
	} else {
		return v2;
	}
}

function cool() {
	maxVel -= .005;
}

function speedLimit(vel) {
	var d = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1]);
	if (d > maxVel) {
		return [maxVel * (vel[0]/d), maxVel * (vel[1]/d)];
	} else {
		return vel;
	}
}

function tick() {
	var start = (new Date()).getTime();
	
	compute_force();

	var entropy = 0;
	var maxX = width / 2;
	var maxY = height / 2;
	//Use the forces to calculate the velocity/position of the nodes
	for (var i=0, l=nodes.length; i < l; i++) {
		var node = nodes[i];
		var vel = node['v'];
		var pos = node['r'];
		var force = node['f'];
		var mass = node['m'];
		
		// Calculate node velocity
		vel[0] = (vel[0] + (timeStep * force[0])) * damping;
		vel[1] = (vel[1] + (timeStep * force[1])) * damping;
		
		entropy += Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1]);
		
		vel = speedLimit(vel);
		//cool();
		
		// Calculate node position
		pos[0] = pos[0] + (timeStep * vel[0]);
		if (pos[0] > maxX || pos[0] < -maxX) {
			width = width * 2;
			postMessage({"cmd": "log", "params": {"message": "newWidth: " + width}});
		}
		
		pos[1] = pos[1] + (timeStep * vel[1]);
		if (pos[1] > maxY || pos[1] < -maxY) {
			height = height * 2;
			postMessage({"cmd": "log", "params": {"message": "newHeight: " + height}});
		}
	}
	
	postMessage({"cmd": "update", "params": {"nodes": nodes, "links": links}});
	
	if (entropy / l < steadyState) {
		lowEntropy++;
	} else {
		lowEntropy = 0;
	}
	if (lowEntropy < 5 && maxVel > 0) {
		var wait = interval - ((new Date()).getTime() - start);
		if (wait < 0) {wait = 0;}
		timer = setTimeout(tick, wait);
	} else {
		timer = null;
		postMessage({"cmd": "log", "params": {"message": "simulation complete"}});
		//postMessage({"cmd": "update", "params": {"nodes": nodes, "links": links}});
	}
}

function getNodeIdxAtCoords(coords) {
	var x = coords[0];
	var y = coords[1];
	for (var i=0, l=nodes.length; i < l; i++) {
		var node = nodes[i];
		var pos = node['r'];
		var mass = node['m'];
		var xMin = pos[0] - mass;
		var xMax = pos[0] + mass;
		var yMin = pos[1] - mass;
		var yMax = pos[1] + mass;
		if (xMin <= x && xMax >= x && yMin <= y && yMax >= y) {
			return i;
		}
	}
	return null;
}

function mousedown(params) {
	var coords = params['coords'];
	var idx = getNodeIdxAtCoords(coords);
	if (idx === null) {return;}
	var node = nodes[idx];
	node['fixed'] = true;
	selectedIdx = idx;
}

function mouseup(params) {
	if (selectedIdx != -1) {
		delete nodes[selectedIdx]['fixed'];
		selectedIdx = -1;
	}
}

function drag(params) {
	if (selectedIdx != -1) {
		var x = params['coords'][0];
		var y = params['coords'][1];
		var node = nodes[selectedIdx];
		node['r'][0] = x;
		node['r'][1] = y;
		if (!timer) {
			start();
		}
	}
}

function pin(params) {
	var coords = params['coords'];
	var idx = getNodeIdxAtCoords(coords);
	if (idx === null) {return;}
	var node = nodes[idx];
	node['fixed'] = true;
}

addEventListener('message', function(evt){
	self[evt.data['cmd']](evt.data['params']);
}, false);