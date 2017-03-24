function Config() {
}

Object.defineProperty(Config.prototype, "updateTimePeriodMinutes", {
  get: function() {
    return 1;
  }
});

Object.defineProperty(Config.prototype, "idle", {
  get: function() {
    if (!localStorage.nextTimeToClear) {
      localStorage.idle = "false";
    }
    return localStorage.idle == "true";
  },
  set: function(i) {
    if (i) {
      localStorage.idle = "true"; 
    } else {
      localStorage.idle = "false";
    }
  }
});
