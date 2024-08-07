Module.register("MMM-CountEvents", {

  defaults: {
    refresh: 1000 * 60,
    title: "nonamed",
    targetTime: "2025-01-01",
    locale: null,
    unit: "auto",
    repeat: false,
    ignoreBefore: false,
    ignoreAfter: false,
    className: "default",
    output: `<dl><dt class="title"></dt><dd class="output"></dd></dl>`,
    numericAlways: false,
    reverse: false,
    numberOnly: false,
    numberSign: false,
    manipulate: null,
    useQuarter: false,
    onPassed: null,
    onUpdated: null,

    events:[],
  },

  getStyles: function() {
    return ["MMM-CountEvents.css"]
  },

  start: function() {
    this.config.identifier = this.config?.identifier ?? 'CE_' + this.identifier
    this.config.locale = this.config?.locale ?? config?.locale ?? "en"
  },

  getDom: function() {
    const wrapper = document.createElement("ul")
    wrapper.classList.add('CE')
    wrapper.id = this.config.identifier
    this.config.events.forEach(ev => {
      const event = this.regularize(ev)
      const mmt = this.mmTime(event)
      if (!mmt) return

      const eventWrapper = document.createElement("li")
      if (event.className) eventWrapper.classList.add(event.className)
      eventWrapper.innerHTML = event.output
      eventWrapper.querySelector(".title").innerHTML = event.title
      eventWrapper.querySelector(".output").appendChild(mmt)
      wrapper.appendChild(eventWrapper)
    })
    return wrapper
  },

  regularize: function(event) {
    const { events, identifier, ...rest } = this.config
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
    if (event.useQuarter) mmt.relativeQuarter = true
    if (event.numberOnly) mmt.classList.add("number-only")
    if (event.numberSign) mmt.classList.add("number-sign")
    mmt.classList.add((targetTime.valueOf() < now) ? "past" : ((targetTime.valueOf() > now) ? "future" : "now"))
    if (event.className) mmt.classList.add(event.className)
    mmt.onPassed = (ev) => {
      let ret = null
      if (typeof event?.onPassed === "function") {
        ret = event.onPassed(event, mmt)
      }
      if (event.repeat) mmt.time = new Date(repeated(event))
      return ret
    }
    mmt.onUpdated = (ev) => {
      let ret = null
      if (typeof event?.onUpdated === "function") {
        ret = event.onUpdated(event, mmt)
      }
      return ret
    }
    if (typeof event?.manipulate === "function") {
      return event.manipulate(mmt)
    }
    return mmt 
  },
})