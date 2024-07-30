const eventFormat = {
	title: "EVENT TITLE",
	targetTime: "20300101",
	yearlyRepeat: false,
	unit: "days",
	humanize:false,
  absolute:false,
  ignore:null,
  className: "",
	output: "D -%RESULT%",
	group: "default"
}

Module.register("MMM-CountEvents", {

  defaults: {
    refreshInterval: 1000,
    locale: null,
    template: "<p class=\"title\">%TITLE%</p><p class=\"output\">%OUTPUT%</p>",
    events:[],
		groupOrder:[],
  },

  getStyles: function() {
    return ["MMM-CountEvents.css"]
  },

  start: function() {
    this.locale = this.config?.locale ?? config?.locale ?? navigator?.languages?.[0] ?? "en"
		this.groupIndex = 0
  },

  notificationReceived: function(noti, payload, sender) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED":
				this.rotateGroup()
        this.updateView()
        break
    }
  },

	rotateGroup: function() {
		if (!this.config.groupOrder) return
		this.groupIndex++
		if (this.groupIndex >= this.config.groupOrder.length) this.groupIndex = 0

		setTimeout(()=>{
			this.rotateGroup()
		}, this.config.groupInterval)
	},

  updateView: function() {
    this.updateDom()
    var timer = setTimeout(()=>{
      this.updateView()
    }, this.config.refreshInterval)
  },

  getDom: function() {
    const wrapper = document.createElement("div")
    wrapper.id = "COUNTEVENTS"
    if (this.config.events.length > 0) {
      for (var i in this.config.events) {
        const event = this.config.events[i]
        this.format(event, wrapper)
      }
    }
    return wrapper
  },

  format: function(event, wrapper) {
    const ev = {...eventFormat, ...ev} 
		if (ev.group !== this.config.groupOrder[this.groupIndex]) {
			if (this.config.groupOrder.length > 0) return
		}
    const now = new Date()
    const thisYear = +now.getFullYear()

    const t = new Date(new String(ev.targetTime))
    //var tRaw = t.format("x")
    //var tYear = t.format("YYYY")

    const tMonth = t.getMonth() + 1
    const tDate = t.getDate()
    const tHour = t.getHours()
    const tMinute = t.getMinutes()
    const tSecond = t.getSeconds()
    
    let nextT = null
    if (ev.yearlyRepeat) {
      nextT = new Date(thisYear, tMonth - 1, tDate, tHour, tMinute, tSecond)
      if (nextT.valueOf() < now.valueOf()) {
        nextT = nextT.setFullYear(thisYear + 1)
      }
    }
      nextT = moment(thisYear.concat(tMonth, tDate, "T", tHour, tMinute, tSecond)).locale(this.locale)
      if (moment().isAfter(nextT)) {
        nextT.add(1, "year")
      }
    } else {
      nextT = t.locale(this.locale)
    }

		var valid = [null, null]
		if (ev.ignore == "before" && now.isBefore(nextT)) return
		if (ev.ignore == "after" && now.isAfter(nextT)) return
		if (Array.isArray(ev.ignore) && ev.ignore.length == 2) valid = [ev.ignore[0], ev.ignore[1]]
		var validStart = (valid[0] !== null ) ? moment(nextT).subtract(valid[0], "day"): false
		var validEnd = (valid[1] !== null ) ? moment(nextT).add(valid[1], "day") : false

		if (validStart && now.isBefore(validStart)) return
		if (validEnd && now.isAfter(validEnd)) return

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
		e.className = "event"
		if (ev.className) e.classList.add(ev.className)
		if (ev.group) e.classList.add(ev.group)
    e.innerHTML = this.config.template.replace("%TITLE%", ev.title).replace("%OUTPUT%", ev.output.replace("%RESULT%", output))
    if (e !== null) {
      wrapper.appendChild(e)
    }
  }
})
