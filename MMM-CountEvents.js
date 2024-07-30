const eventFormat = {
  title: "EVENT TITLE",
  targetTime: "2030-01-01",
  locale: "en",
  repeat: false, // "yearly", "monthly", "weekly", "daily", "hourly"
  ignoreBefore: null,
  ignoreAfter: 1000 * 60 * 60 * 24 * 7, 
  humanize:false,
  absolute:false,
  ignore:null, 
  className: "",
  output: `<dl><dt class="title">%TITLE%</dt><dd class="output">%RESULT%</dd></dl>`,
  refresh: null,
}

Module.register("MMM-CountEvents", {

  defaults: {
    refresh: null,
    events:[
     
    ],
  },

  getStyles: function() {
    return ["MMM-CountEvents.css"]
  },

  getDom: function() {
    const wrapper = document.createElement("div")
    this.config.events.forEach(event => {
      const mmt = this.mmTime(event)
      if (!mmt) return
      const eventWrapper = document.createElement("div")
      eventWrapper.innerHTML = eventFormat.output
        .replace(/%TITLE%/g, event.title)
        .replace(/%RESULT%/g, mmt.outerHTML)
      wrapper.appendChild(eventWrapper)
    })
    return wrapper
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
    console.log({targetTime}, targetTime.valueOf())
    console.log('ignoreBefore', targetTime.valueOf() - +event.ignoreBefore, new Date(targetTime.valueOf() - +event.ignoreBefore), Date.now())
    console.log('ignoreAfter', targetTime.valueOf() + +event.ignoreAfter, new Date(targetTime.valueOf() + +event.ignoreAfter), Date.now())
    console.log(!event.ignoreBefore, targetTime.valueOf() - +event.ignoreBefore > Date.now())
    if (event.ignoreBefore, targetTime.valueOf() - +event.ignoreBefore > Date.now()) {
      console.log("1")
      return false
    }
    if (event.ignoreAfter && targetTime.valueOf() + +event.ignoreAfter < Date.now()) {
      console.log("2")
      return false
    }
    const mmt = document.createElement("mm-time")
    mmt.relative = true
    mmt.locale = event.locale
    mmt.time = targetTime
    mmt.dataset.numeric = (event.numericAlways) ? 'always' : 'auto'
    if (event.unit) mmt.relativeUnit = event.unit
    if (event.reverse) mmt.relativeReverse = event.reverse
    if (event.refresh && event.refresh >= 1000) mmt.refresh = event.refresh
    if (event.decouple) mmt.decouple = event.decouple
    if (event.numberOnly) mmt.classList.add("number-only")
    if (event.className) mmt.classList.add(event.className)
    if (typeof event?.manipulate === "function") {
      return event.manipulate(mmt)
    }
    return mmt 
  },


})