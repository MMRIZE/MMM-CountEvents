const eventFormat = {
	title: "EVENT TITLE",
	targetTime: "20200101",
	yearlyRepeat: false,
	unit: "days",
	humanize:false,
  absolute:false,
  ignore:null,
  className: "",
	output: "D -%RESULT%"
}

Module.register("MMM-CountEvents", {

  defaults: {
    refreshInterval:1000*1,
    locale: null,
    template: "<p class=\"title\">%TITLE%</p><p class=\"output\">%OUTPUT%</p>",
    events:[],
  },

  getScripts: function() {
    return ["moment.js"]
  },

  getStyles: function() {
    return ["MMM-CountEvents.css"]
  },

  start: function() {
    if (this.config.locale == null || this.config.locale == "") {
      this.locale = moment.locale()
    } else {
      this.locale = this.config.locale
    }
  },

  notificationReceived: function(noti, payload, sender) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED":
        this.updateView()
        break
    }
  },

  updateView: function() {
    this.updateDom()
    var timer = setTimeout(()=>{
      this.updateView()
    }, this.config.refreshInterval)
  },

  getDom: function() {
    var wrapper = document.createElement("div")
    wrapper.id = "COUNTEVENTS"
    if (this.config.events.length > 0) {
      for (var i in this.config.events) {
        var event = this.config.events[i]
        this.format(event, wrapper)
      }
    }
    return wrapper
  },

  format: function(ev, wrapper) {
    ev = Object.assign({}, eventFormat, ev)
    var now = moment()
    var thisYear = now.format("YYYY")

    var t = moment(ev.targetTime)
    var tRaw = t.format("x")
    var tYear = t.format("YYYY")
    var tMonth = t.format("MM")
    var tDate = t.format("DD")
    var tHour = t.format("HH")
    var tMinute = t.format("mm")
    var tSecond = t.format("ss")

    var nextT = null
    if (ev.yearlyRepeat) {
      nextT = moment(thisYear.concat(tMonth, tDate, "T", tHour, tMinute, tSecond)).locale(this.locale)
      if (moment().isAfter(nextT)) {
        nextT.add(1, "year")
      }
    } else {
      nextT = t.locale(this.locale)
    }


    if (ev.ignore == "before" && now.isBefore(nextT)) {
      return
    }
    if (ev.ignore == "after" && now.isAfter(nextT)) {
      return
    }


    var duration = moment.duration(nextT.diff(now))
    var output = ""
    if (ev.humanize) {
      output = nextT.fromNow()
    } else {
      output = Math.floor(duration.as(ev.unit))
      if (ev.absolute) {
        output = Math.abs(output)
      }
    }


    var e = document.createElement("div")
    e.id = "COUNTEVENTS_ITEM"
    e.className = "event " + ev.className
    e.innerHTML = this.config.template.replace("%TITLE%", ev.title).replace("%OUTPUT%", ev.output.replace("%RESULT%", output))
    if (e !== null) {
      wrapper.appendChild(e)
    }
  }
})
