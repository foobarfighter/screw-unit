(function(Screw, Monarch, jQuery) {

Monarch.constructor("Screw.Interface.Runner", Monarch.View.Template, {
  constructor_properties: {
    run_specs_on_page_load: function() {
      jQuery(function() {
        var queue = new Monarch.Queue();
        var runner;
        queue.add(function() {
          runner = Screw.Interface.Runner.to_view({root: Screw.root_description(), show: jQuery.cookie("__screw_unit__show") || "all"});
        });
        queue.add(function() {
          Screw.$('body').html(runner);
        });
        queue.add(function() {
          runner.run();
        })
        queue.start();
      });
    }
  },

  content: function(initial_attributes) { with (this.builder) {
    div({'id': "screw_unit_runner"}, function() {
      table({'id': "screw_unit_header"}, function() {
        tbody(function() {
          tr(function() {
            td({'id': "screw_unit_controls"}, function() {
              button({'id': "show_all"}, "Show All").click(function(view) {
                view.show_all();
              });
              button({'id': "show_failed"}, "Show Failed").click(function(view) {
                view.show_failed();
              });
              button({'id': "rerun_all"}, "Rerun All").click(function(view) {
                view.rerun_all();
              });
              button({'id': "rerun_failed"}, "Rerun Failed").click(function(view) {
                view.rerun_failed();
              });
            });
            td(function() {
              subview('progress_bar', Screw.Interface.ProgressBar, {examples_to_run: Screw.Interface.examples_to_run()});
            });
          })
        })
      });

      div({'id': 'test_content'});

      ul({'class': 'descriptions'}, function() {
        subview('root_description', Screw.Interface.Description, {description: initial_attributes.root, build_immediately: initial_attributes.build_immediately});
      });
    });
  }},

  view_properties: {
    initialize: function() {
      if (this.show == "all") this.addClass('show_all');
      if (this.show == "failed") this.addClass("show_failed");

      var root_description = Screw.root_description();
      var completed_example_count = 0;
      var total_example_count = root_description.total_examples();
      root_description.on_example_completed(function() {
        completed_example_count++;
        if (completed_example_count == total_example_count) {
          var outcome = (root_description.failed_examples().length == 0) ? "success" : root_description.failure_messages().join("\n");
          Screw.$.ajax({ type: 'POST', url: '/complete', data: outcome });
        }
      });
    },

    show_failed: function() {
      jQuery.cookie("__screw_unit__show", "failed");
      this.addClass('show_failed');
      this.removeClass('show_all');
    },

    show_all: function() {
      jQuery.cookie("__screw_unit__show", "all");
      this.addClass('show_all');
      this.removeClass('show_failed');
    },

    rerun_failed: function() {
      throw new Error("not implemented");
    },

    rerun_all: function() {
      throw new Error("not implemented");
    },

    run: function() {
      var self = this;
      this.completed_example_count = 0;
      this.total_examples = Screw.root_description().total_examples();

      var queue = new Monarch.Queue();

      Screw.root_description().on_example_completed(function() { self.update() } );
      Monarch.Util.each(Screw.Interface.examples_to_run(), function(example) {
        queue.add(function() {
          example.run();
        })
      });

      queue.start();
    },

    update: function() {
      this.completed_example_count++;
          
      if (this.completed_example_count == this.total_examples) {
        var is_success = (Screw.root_description().failed_examples().length == 0);
        this.find("ul.descriptions").addClass(is_success ? "passed" : "failed");
      }
    }
  }
});

})(Screw, Monarch, jQuery);
