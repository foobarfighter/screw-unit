(function(Screw, Monarch) {

Monarch.constructor("Screw.Deferred", {
  initialize: function(fn, timeout) {
		this.runner = fn;
		this.timeout = timeout || 300;
		this.fail_node = new Monarch.SubscriptionNode();
		this.success_node = new Monarch.SubscriptionNode();
		this._interval = null;
    this.last_error = null;
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
				self.runner();
				if (new Date().getTime() - start > self.timeout){
          var error;
          if (self.last_error){
            error = self.last_error;
            error.message = "timeout exceeded, last error was: " + error.message;
          } else {
            error = new Error("timeout exceeded");; 
          }
					throw error;
				}
			} catch(e) {
				self.fail(e);
			}
		}, 20);
	}
});

})(Screw, Monarch);
