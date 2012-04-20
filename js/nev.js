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
			this.ctx.textAlign = 'center';
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
			for (var idx in this.links) {
				var link = this.links[idx];
				this.drawLink(link);
			}
			for (var idx in this.nodes) {
				var node = this.nodes[idx];
				this.drawNode(node);
			}
		},
		drawNode: function(node) {
			var pos = node['r'];
			var vel = node['v'];
			var force = node['f'];
			this.ctx.fillStyle = node['c'];
			this.ctx.beginPath();
			this.ctx.arc(pos[0], pos[1], node['m'], 0, 2 * Math.PI, false);
			this.ctx.closePath();
			this.ctx.stroke();
			this.ctx.fill();
			/*var txt = "fx:" + Math.round(force[0], 2).toString() + " fy:" + Math.round(force[1], 2).toString();
			this.ctx.save();
			this.ctx.scale(1, -1);
			this.ctx.fillStyle = "#000000";
			this.ctx.fillText(txt, pos[0], - pos[1] + 20);
			this.ctx.restore();*/
		},
		drawLink: function(link) {
			var posA = this.nodes[link['a']]['r'];
			var posB = this.nodes[link['b']]['r'];
			this.ctx.beginPath();
			this.ctx.moveTo(posA[0], posA[1]);
			this.ctx.lineTo(posB[0], posB[1]);
			this.ctx.closePath();
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
			this.nodes = nodes;
			this.links = links;
			this.computeEngine.postMessage({"cmd": "init", "params": {"nodes": this.nodes, "links": this.links, "width": 1000, "height": 1000}});
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