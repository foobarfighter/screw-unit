(function(Screw, Monarch) {

Monarch.constructor("Screw.Deferred", {
  initialize: function(fn, timeout) {
		this.runner = fn;
		this.timeout = timeout || 300;
		this.fail_node = new Monarch.SubscriptionNode();
		this.success_node = new Monarch.SubscriptionNode();
		this._interval = null;
  },

	on_success: function(callback){
		return this.success_node.subscribe(callback);
	},

	on_fail: function(callback){
		return this.fail_node.subscribe(callback);
	},

	succeed_if: function(condition){
		if (condition){
			clearInterval(this._interval);
			this.success_node.publish();
		}
	},

	fail: function(error){
		if (typeof error == "string"){
			error = new Error(error);
		}
		clearInterval(this._interval);
		this.fail_node.publish(error);
	},

	run: function(){
		this._poll();
	},

	_poll: function(){
		var self = this;
		var start = new Date().getTime();
		self._interval = setInterval(function(){
			try {
				console.debug("polling");
				self.runner();
				if (new Date().getTime() - start > self.timeout){
					throw new Error("timeout exceeded");
				}
			} catch(e) {
				console.debug("error caught", e);
				self.fail(e);
			}
		}, 20);
	}
});

})(Screw, Monarch);
