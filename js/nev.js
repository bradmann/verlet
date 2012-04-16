(function(){
	var VisEngine = {
		timer: null, canvas: null, ctx: null, interval: null, nodes: null, links: null, width: 1000, height: 500,
		init: function(canvas, fps){
			var self = this;
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');
			this.ctx.scale(1, -1);
			this.ctx.translate(this.width/2, -this.height/2);
			this.interval = Math.floor(1/fps * 1000);
			//setTimeout(function(){self.tick();}, 0);
		},
		tick: function() {
			var self = this;
			var start = (new Date()).getTime();
			this.draw();
			var wait = this.interval - ((new Date()).getTime() - start);
			this.timer = setTimeout(function(){self.tick();}, wait);
		},
		draw: function() {
			this.ctx.clearRect(-this.width/2, -this.height/2, this.width, this.height);
			for (var idx in this.nodes) {
				var node = this.nodes[idx];
				this.drawNode(node);
			}
			for (var idx in this.links) {
				var link = this.links[idx];
				this.drawLink(link);
			}
		},
		drawNode: function(node) {
			this.ctx.beginPath();
			this.ctx.arc(node['x'], node['y'], node['m'], 0, 2 * Math.PI, false);
			this.ctx.fill();
		},
		drawLink: function(link) {
			var nodeA = link['a'];
			var nodeB = link['b'];
			this.ctx.moveTo(this.nodes[nodeA]['x'], this.nodes[nodeA]['y']);
			this.ctx.lineTo(this.nodes[nodeB]['x'], this.nodes[nodeB]['y']);
			this.ctx.stroke();
		}
	};
	
	NEV = Object.create({
		visEngine: null, computeEngine: null, canvas: null,
		nodes: [], links: [],
		init: function(canvas, fps) {
			var self = this;
			this.canvas = canvas;
			this.visEngine = Object.create(VisEngine);
			this.visEngine.init(canvas, fps);
			this.computeEngine = new Worker('js/compute.js');
			this.computeEngine.addEventListener('message', function(evt){
				self[evt.data['cmd']](evt.data['params']);
			}, false);
		},
		loadGraph: function(nodes, links) {
			this.nodes = [{"x": -50, "y": 4, "px": -10, "py": 4, "vx": 0, "vy": 0, "m": 5, "c": "#000", "data": null}, {"x": 150, "y": 1, "px": 10, "py": 1, "vx": 0, "vy": 0, "m": 5, "c": "#000", "data": null}];
			this.links = [{"a": 0, "b": 1}];
			this.computeEngine.postMessage({"cmd": "init", "params": {"nodes": this.nodes, "links": this.links, "width": self.canvas.width, "height": self.canvas.height}});
			this.visEngine.nodes = this.nodes;
		},
		update: function(params) {
			this.visEngine.nodes = params["nodes"];
			this.visEngine.links = params["links"];
			this.visEngine.draw();
		},
		log: function(params) {
			console.log(params['message']);
		}
	});
})();