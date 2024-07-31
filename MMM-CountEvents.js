Module.register("MMM-CountEvents", {

  defaults: {
    refresh: 1000 * 60,
    title: "nonamed",
    locale: null,
    unit: "auto",
    repeat: false,
    ignoreBefore: false,
    ignoreAfter: false,
    className: "default",
    output: `<dl><dt><span class="title"></span></dt><dd class="output"><span class="output"></span></dd></dl>`,
    numericAlways: false,
    reverse: false,
    numberOnly: false,
    numberSign: false,
    manipulate: null,
    useQuarter: false,
    onPassed: null,

    events:[],
  },

  getStyles: function() {
    return ["MMM-CountEvents.css"]
  },

  start: function() {
    this.config.identifier = this.config?.identifier ?? 'CE_' + this.identifier

  },

  getDom: function() {
    const wrapper = document.createElement("ul")
    wrapper.classList.add('CE')
    wrapper.id = this.config.identifier
    this.config.events.forEach(ev => {
      const event = this.regularize(ev)
      console.log(event)
      const mmt = this.mmTime(event)
      if (!mmt) return

      const eventWrapper = document.createElement("li")
      eventWrapper.innerHTML = event.output
      eventWrapper.querySelector(".title").textContent = event.title
      eventWrapper.querySelector(".output").appendChild(mmt)
      wrapper.appendChild(eventWrapper)
    })
    return wrapper
  },

  regularize: function(event) {
    const { events, identifier, ...rest } = this.config
    console.log(rest, event)
    return { ...rest, ...event }
  },

  mmTime: function(event) {
    const repeated = (event) => {
      const t = new Date(event.targetTime)
      const n = new Date(Date.now())
      const tMonth = t.getMonth()
      const tDate = t.getDate()
      const tHour = t.getHours()
      const tMinute = t.getMinutes()
      const tSecond = t.getSeconds()
      const tMilisecond = t.getMilliseconds()
      const nYear = n.getFullYear()
      const nMonth = n.getMonth()
      const nDate = n.getDate()
      const nHour = n.getHours()

      let nextT = new Date(t)
      switch (event.repeat) {
        case "yearly":
          nextT = new Date(nYear, tMonth, tDate, tHour, tMinute, tSecond, tMilisecond)
          if (nextT.valueOf() < n.valueOf()) nextT.setFullYear(nYear + 1)
          break
        case "monthly":
          nextT = new Date(nYear, nMonth, tDate, tHour, tMinute, tSecond, tMilisecond)
          if (nextT.valueOf() < n.valueOf()) nextT.setMonth(nMonth + 1)
          if (nextT.getDate() !== tDate) nextT.setDate(0)
          break
        case "weekly":
          nextT = new Date(nYear, nMonth, nDate, tHour, tMinute, tSecond, tMilisecond)
          const dayDiff = t.getDay() - nextT.getDay()
          if (dayDiff === 0 && n.valueOf() > nextT.valueOf()) nextT.setDate(nDate + 7)
          if (dayDiff !== 0) nextT.setDate(nDate + ((dayDiff + 7) % 7))
          break
        case "daily":
          nextT = new Date(nYear, nMonth, nDate, tHour, tMinute, tSecond, tMilisecond)
          if (nextT.valueOf() < n.valueOf()) nextT.setDate(nDate + 1)
          break
        case "hourly":
          nextT = new Date(nYear, nMonth, nDate, nHour, tMinute, tSecond, tMilisecond)
          if (nextT.valueOf() < n.valueOf()) nextT.setHours(nHour + 1)
          break
        default: break
      }
      return nextT
    }

    const targetTime = new Date(repeated(event))
    const now = Date.now()
    if (event.ignoreBefore && targetTime.valueOf() - +event.ignoreBefore > now) return false
    if (event.ignoreAfter && targetTime.valueOf() + +event.ignoreAfter < now) return false

    const mmt = document.createElement("mm-time")
    mmt.relative = true
    mmt.locale = event?.locale ?? this.config?.locale ?? config?.locale ?? "en"
    mmt.time = targetTime
    mmt.decouple = true
    mmt.dataset.numeric = (event.numericAlways) ? 'always' : 'auto'
    if (event.unit) mmt.relativeUnit = event.unit
    if (event.reverse) mmt.relativeReverse = event.reverse
    if (event.refresh && event.refresh >= 1000) mmt.refresh = event.refresh
    //if (event.decouple) mmt.decouple = event.decouple
    if (event.useQuarter) mmt.relativeQuarter = true
    if (event.numberOnly) mmt.classList.add("number-only")
    if (event.numberSign) mmt.classList.add("number-sign")
    mmt.classList.add((targetTime.valueOf() < now) ? "past" : ((targetTime.valueOf() > now) ? "future" : "now"))
    if (event.className) mmt.classList.add(event.className)
    mmt.onPassed = (ev) => {
      let ret = null
      if (typeof event?.onPassed === "function") {
        ret = event.onPassed(ev)
      }
      if (event.repeat) mmt.time = new Date(repeated(event))
      return ret
    } 
    if (typeof event?.manipulate === "function") {
      return event.manipulate(mmt)
    }
    return mmt 
  },


})