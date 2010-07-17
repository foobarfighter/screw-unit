(function(Screw, Monarch) {

Monarch.module("Screw.Matchers", {
  equal: {
    match: function(expected, actual) {
      if(expected == actual) return true;
      if(actual == undefined) return false;

      if (expected instanceof Array) {
        if (! (actual instanceof Array)) return false;
        for (var i = 0; i < actual.length; i++)
          if (!Screw.Matchers.equal.match(expected[i], actual[i])) return false;
        return actual.length == expected.length;
      } else if (expected instanceof Object) {
        for (var key in expected)
          if (!this.match(expected[key], actual[key])) return false;
        for (var key in actual)
          if (!this.match(actual[key], expected[key])) return false;
        return true;
      }
      return false;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not equal ' : ' to equal ') + Screw.$.print(expected);
    }
  },

  be_gt: {
    match: function(expected, actual) {
      return actual > expected;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be greater than ' + Screw.$.print(expected);
    }
  },

  be_gte: {
    match: function(expected, actual) {
      return actual >= expected;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be greater than or equal to ' + Screw.$.print(expected);
    }
  },

  be_lt: {
    match: function(expected, actual) {
      return actual < expected;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be less than ' + Screw.$.print(expected);
    }
  },

  be_lte: {
    match: function(expected, actual) {
      return actual <= expected;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be less than or equal to ' + Screw.$.print(expected);
    }
  },

  match: {
    match: function(expected, actual) {
      if (expected.constructor == RegExp)
        return expected.exec(actual.toString());
      else
        return actual.indexOf(expected) > -1;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not match ' : ' to match ') + Screw.$.print(expected);
    }
  },

  be_blank: {
    match: function(expected, actual) {
      if (actual == undefined) return true;
      if (typeof(actual) == "string") actual = actual.replace(/^\s*(.*?)\s*$/, "$1");
      return Screw.Matchers.be_empty.match(expected, actual);
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be blank' : ' to be blank');
    }
  },

  be_empty: {
    match: function(expected, actual) {
      if (actual.length == undefined) throw(new Error(actual.toString() + " does not respond to length"));

      return actual.length == 0;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be empty' : ' to be empty');
    }
  },

  have_length: {
    match: function(expected, actual) {
      if (actual.length == undefined) throw(new Error(actual.toString() + " does not respond to length"));

      return actual.length == expected;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not' : ' to') + ' have length ' + expected;
    }
  },

  be_an_instance_of: {
    match: function(expected, actual) {
      return actual instanceof eval(expected);
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + typeof actual + (not ? ' not' : '') + ' be an instance of ' + expected;
    }
  },

  be_null: {
    match: function(expected, actual) {
      return actual == null;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be null' : ' to be null');
    }
  },

  be_undefined: {
    match: function(expected, actual) {
      return actual === undefined;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be undefined' : ' to be undefined');
    }
  },

  be_true: {
    match: function(expected, actual) {
      return actual;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be true' : ' to be true');
    }
  },

  be_false: {
    match: function(expected, actual) {
      return !actual;
    },

    failure_message: function(expected, actual, not) {
      return 'expected ' + Screw.$.print(actual) + (not ? ' to not be false' : ' to be false');
    }
  },

  have_been_called: {
    match: function(expectation, mock_function) {
      if (expectation) {
        return this.match_with_expectation(expectation, mock_function);
      } else {
        return mock_function.call_count > 0;
      }
    },

    match_with_expectation: function(expectation, mock_function) {
      if (expectation.__with_args__) {
        return Screw.Matchers.equal.match(expectation.arguments, mock_function.most_recent_args);
      } else if (expectation.__on_object__) {
        return Screw.Matchers.equal.match(expectation.object, mock_function.most_recent_this_value);
      } else if (typeof expectation == "number") {
        return mock_function.call_count == expectation;
      } else {
        throw new Error("unrecognized expectation argument for mock function: " + expectation);
      }
    },

    error_message_expectation_fragment: function(expectation, not) {
      if (!expectation) {
        if (not) {
          return "";
        } else {
          return " at least once";
        }
      } else {
        if (expectation.__with_args__) {
          return " with arguments " + Screw.$.print(expectation.arguments);
        } else if (expectation.__on_object__) {
          return " on object " + Screw.$.print(expectation.object);
        } else {
          return " " + expectation + " time" + ((expectation == 1) ? "" : "s");
        }
      }
    },

    error_message_actual_fragment: function(expected, actual, not) {
      if (expected && expected.__with_args__) {
        return "with arguments " + Screw.$.print(actual.most_recent_args);
      } else if (expected && expected.__on_object__) {
        return "on object " + Screw.$.print(actual.most_recent_this_value);
      } else {
        return actual.call_count + " time" + ((actual.call_count == 1) ? "" : "s");
      }
    },

    failure_message: function(expected, actual, not) {
      var message;
      if (not) {
        message = 'expected ' + actual.function_name + ' to have not been called' + this.error_message_expectation_fragment(expected, not);
      } else {
        message = 'expected ' + actual.function_name + ' to have been called' + this.error_message_expectation_fragment(expected, not);
      }
      message += ' but it was called ' + this.error_message_actual_fragment(expected, actual, not);
      return message;
    }
  },

  once: 1,
  twice: 2,
  thrice: 3,

  with_args: function() {
    return {
      __with_args__: true,
      arguments: Array.prototype.slice.call(arguments)
    };
  },

  on_object: function(object) {
    return {
      __on_object__: true,
      object: object
    };
  },

  contain: {
    match: function(expected, actual) {
      for(var i = 0; i < actual.length; i++) {
        if (actual[i] == expected) return true;
      }
      return false;
    },

    failure_message: function(expected, actual, not) {
      if (not) {
        return "expected " + Screw.$.print(actual) + " to not contain " + Screw.$.print(expected) + ", but it did";
      } else {
        return "expected " + Screw.$.print(actual) + " to contain " + Screw.$.print(expected) + ", but it did not";
      }
    }
  },

  throw_exception: {
    match: function(expected, actual) {
      var threw_exception;
      try {
        actual();
        threw_exception = false;
      } catch(e) {
        threw_exception = true;
      }
      return threw_exception;
    },

    failure_message: function(expected, actual, not) {
      if (not) {
        return "expected function to not throw an exception, but it did";
      } else {
        return "expected function to throw an exception, but it did not";
      }
    }
  }
});

})(Screw, Monarch);
