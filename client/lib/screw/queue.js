(function(Screw, Monarch) {

Monarch.constructor("Screw.Queue", Screw.RunnableMethods, {
  initialize: function(name, fn) {
    console.debug("queue initialized: ", name);
  },

  add: function(){
    console.debug("adding to queue: ", arguments[0].toString());
  },

  start: function(){
    console.debug("starting queue: ", arguments);
  }
})

})(Screw, Monarch);
