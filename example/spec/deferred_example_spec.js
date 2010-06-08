//= require "spec_helper"

Screw.Unit(function(c) { with(c) {
	describe("when you need to test things that happen asynchronously", function(){
		it("can help to use deferred tests", function(){
			var called = false;
			setTimeout(function(){
				called = true;
			}, 100);

			this.deferred = new Screw.Deferred(function(){
				this.succeed_if(called);
			}, 300);
		});
	});
}});
