(function(Screw, Monarch) {

Monarch.constructor("Screw.Example", Screw.RunnableMethods, {
  initialize: function(name, fn) {
    this.name = name;
    this.fn = fn;
    this.fail_subscription_node = new Monarch.SubscriptionNode();
    this.pass_subscription_node = new Monarch.SubscriptionNode();
    this.example_completed_subscription_node = new Monarch.SubscriptionNode();
    this.passed = false;
    this.failed = false;
    this.failure_message = null;
		this.task_complete_handler = null;
		this.deferred = null;
  },

  clone: function() {
    var clone = Screw.$.extend(new Screw.Example(), this);
    clone.initialize(this.name, this.fn);
    return clone;
  },
  
  add_to_queue: function(queue) {
    var self = this;
    queue.add(function() {
			self.task_complete_handler = queue.on_task_complete(function(){
				self.task_complete.apply(self, arguments);
			});
      self.run();
    });
  },

	task_complete: function(queue) {
		if (!this.deferred) {
			queue.remove_on_task_complete(this.task_complete_handler);
			queue.run_next();
		} else {
			this.handle_deferred(queue, this.deferred);
		}
	},

	handle_deferred: function(queue, deferred) {
		var self = this;

		var cleanup = function(){
			self.parent_description.run_afters(self.example_context);		// TODO: Error handling
			Screw.reset_mocks();
			queue.remove_on_task_complete(self.task_complete_handler);
			queue.run_next();
		}

		deferred.on_fail(function(error){
			self.report_failed(error);
			cleanup();
		});

		deferred.on_success(function(){
			self.report_passed();
			cleanup();
		});

		deferred.run();
	},

  run: function() {
		var example_context = { deferred: null }, passed = false;
		try {
			this.parent_description.run_inits(example_context);
			this.parent_description.run_befores(example_context);
			this.fn.call(example_context);
			passed = true;
		} catch(e) {
			this.report_failed(e);
		} finally {
			this.deferred = example_context.deferred;
			this.example_context = example_context;
			if (!this.deferred  || !passed){
				this.parent_description.run_afters(example_context);
				Screw.reset_mocks();
			}
		}
		
		if (passed && !this.deferred){
			this.report_passed();
		}
  },

	report_passed: function(){
		this.passed = true;
		this.pass_subscription_node.publish();
		this.example_completed_subscription_node.publish(this);
	},

	report_failed: function(e){
		this.failed = true;
		if (!e.stack) {
			e.stack = e.message + " (" + e.sourceURL + ":" + e.line + ")";
		}

		this.failure_message = e.message;
		this.stack = e.stack;
		this.fail_subscription_node.publish(e);
		this.example_completed_subscription_node.publish(this);
	},

  on_fail: function(callback) {
    this.fail_subscription_node.subscribe(callback);
  },

  on_pass: function(callback) {
    this.pass_subscription_node.subscribe(callback);
  },

  total_examples: function() {
    return 1;
  },

  full_name: function() {
    return this.parent_description.full_name() + this.name;
  }
});

})(Screw, Monarch);
