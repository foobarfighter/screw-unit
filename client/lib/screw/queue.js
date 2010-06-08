(function(Screw, Monarch) {

Monarch.constructor("Screw.Queue", Screw.RunnableMethods, {
  initialize: function(name, fn) {
		this.fns = [];
		this.task_completed_node = new Monarch.SubscriptionNode();
  },

  add: function(fn){
		this.fns.push(fn);
  },

	run_next: function(){
		if (!this.fns.length){ console.debug("end of queue"); return; }
		var fn = this.fns.shift();
		var self = this;

		// This might be a little hacky but it has two really great benefits
		// 	1. It unwinds the stack of whatever is calling run_next so it's
		//		 impossible to get "too much recursion errors".
		//	2. It allows the UI thread to draw between tests, giving the user
		//		 great feedback and a feeling of responsiveness - BR
		setTimeout(function(){
			fn();
			self.task_completed_node.publish(self);
		}, 0);
	},

  start: function(){
		this.run_next();
  },

	on_task_complete: function(callback){
		return this.task_completed_node.subscribe(callback);
	},

	remove_on_task_complete: function(subscription){
		this.task_completed_node.unsubscribe(subscription);
	}
})

})(Screw, Monarch);
