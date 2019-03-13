# MMM-CountEvents
Countdown or countup for events

## Screenshots
![screenshot](https://github.com/eouia/MMM-CountEvents/blob/master/screenshot.png?raw=true)


## Installation
```shell
cd ~/MagicMirror/modules
git clone https://github.com/eouia/MMM-CountEvents.git
```

## Configuration
### Simple Version
```javascript
{
  module: "MMM-CountEvents",
  position: "top_right",
  config: {
    events: [
      {
        title: "Travel to Paris",
        targetTime: "21 Nov 2018",
      },
    ]
  }
},
```
### Default values and details
```javascript
{
  module: "MMM-CountEvents",
  position: "top_right",
  config: {
    groupOrder: [], // When it set, the group of event which has same group name will be displayed and be rotated to others by groupInterval
    groupInterval: 1000*5,
    refreshInterval:1000*1,
    locale: null, //related with `humanize` (if omitted or null, MM default locale will be used.)
    template: "<p class=\"title\">%TITLE%</p><p class=\"output\">%OUTPUT%</p>",
    //You can modify HTML rendering.
    //%TITLE% : will be replaced by event.title
    //%OUTPUT% : will be replaced by event.output
    events: [
      {
        group: "default",
        title: "Travel to Paris",
        targetTime: "21 Nov 2018", // See the time format section.
      	yearlyRepeat: false, // if this event should be refreshed yearly, set this to `true`. targetTime will be replaced the closest next date of this year or the next year.
      	unit: "days", // "years", "months", "weeks", "days", "hours", "minutes", "seconds"...
        //but if you set `humanize` to true, `unit` will be ignored.
      	humanize:false, //If set as `true`, %RESULT% will be humanized. (e.g "a year ago")
        absolute:false, //If set as `false`, remain duration will be `plus number`, past duration will be `minus number`. If set as `true`, all duration will be `plus number`
        ignore:null, //Available [null, "before", "after"]. This event will not be displayed `before|after` targetTime
        className: "", //You can assign class name to this event for beautifying with CSS.
      	output: "D -%RESULT%", //You can modify output text. %RESULT% will be result of countdown/up calculation with above options.
      },
    ]
  }
},
```

### Screenshot example
![screenshot](https://github.com/eouia/MMM-CountEvents/blob/master/screenshot.png?raw=true)
```javascript
{
  module: "MMM-CountEvents",
  position: "top_right",
  config: {
    locale: "de-DE",
    refreshInterval:1000*1,
    events: [
      {
        title: "My Birthday (yearlyRepeat)",
        targetTime: "1974-08-19",
        yearlyRepeat: true,
        unit: "days",
        humanize:false,
        output: "D - %RESULT%"
      },
      {
        title: "My Birthday (yearlyRepeat, humanized)",
        targetTime: "1974-08-19",
        yearlyRepeat: true,
        unit: "days",
        humanize:true,
        output: "%RESULT%"
      },
      {
        title: "My Born Date (past, absolute)",
        targetTime: "1974-08-19",
        yearlyRepeat: false,
        unit: "days",
        humanize:false,
        absolute:true,
        output: "D + %RESULT%"
      },
      {
        title: "My Born Date (past, humanized)",
        targetTime: "1974-08-19",
        yearlyRepeat: false,
        unit: "days",
        humanize:true,
        output: "%RESULT%"
      },
      {
        title: "My Birthday Next Year (future)",
        targetTime: "2019-08-19",
        yearlyRepeat: false,
        unit: "days",
        humanize:false,
        output: "D - %RESULT%"
      },
      {
        title: "My Birthday Next Year (future, humanized)",
        targetTime: "2019-08-19",
        yearlyRepeat: false,
        unit: "days",
        humanize:true,
        output: "%RESULT%"
      },
      {
        title: "New Year in Minutes (className)",
        targetTime: "20190101",
        yearlyRepeat: true,
        unit: "minutes",
        humanize:false,
        className: "special",
        output: "%RESULT% minutes remain."
      },
      {
        title: "Passed days of this year (no absolute)",
        targetTime: "20180101",
        yearlyRepeat: false,
        unit: "days",
        humanize:false,
        output: "%RESULT% days passed."
      },
      {
        title: "DoomsDayCountdown(8 Aug 2018 09:00 PM)",
        targetTime: "8 Aug 2018 21:00",
        yearlyRepeat: false,
        unit: "seconds",
        humanize:false,
        ignore: "after", // this event will not be displayed after 8 Aug 2018 09:00 PM
        output: "%RESULT% seconds."
      },
    ]
  }
},
```

### Use Group
You can assign event group to each event.
```js
events: [
  {
    group: "Birthday",
    title: "My Birthday",
    targetTime: "1974-08-19",
  },
  ...
],
```
Then, you can show events by group with this configuration.

```js
config: {
  groupOrder: ["Birthday", "Business"],
  groupInterval: 1000*5,
  refreshInterval:1000*1,
  ...
```

If you don't want using group, just set `groupOrder:[]`.


### Time format
[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) and [RFC 2822](https://tools.ietf.org/html/rfc2822#section-3.3) available.

```
[RFC 2822]
6 Mar 17 21:22 UT
6 Mar 17 21:22:23 UT
6 Mar 2017 21:22:23 GMT
06 Mar 2017 21:22:23 Z
Mon 06 Mar 2017 21:22:23 z
Mon, 06 Mar 2017 21:22:23 +0000

[ISO 8601]
2013-02-08  # A calendar date part
2013-W06-5  # A week date part
2013-039    # An ordinal date part

20130208    # Basic (short) full date
2013W065    # Basic (short) week, weekday
2013W06     # Basic (short) week only
2013050     # Basic (short) ordinal date

2013-02-08T09            # An hour time part separated by a T
2013-02-08 09            # An hour time part separated by a space
2013-02-08 09:30         # An hour and minute time part
2013-02-08 09:30:26      # An hour, minute, and second time part
2013-02-08 09:30:26.123  # An hour, minute, second, and millisecond time part
2013-02-08 24:00:00.000  # hour 24, minute, second, millisecond equal 0 means next day at midnight

20130208T080910,123      # Short date and time up to ms, separated by comma
20130208T080910.123      # Short date and time up to ms
20130208T080910          # Short date and time up to seconds
20130208T0809            # Short date and time up to minutes
20130208T08              # Short date and time, hours only

2013-02-08 09  # A calendar date part and hour time part
2013-W06-5 09  # A week date part and hour time part
2013-039 09    # An ordinal date part and hour time part

2013-02-08 09+07:00            # +-HH:mm
2013-02-08 09-0100             # +-HHmm
2013-02-08 09Z                 # Z
2013-02-08 09:30:26.123+07:00  # +-HH:mm
2013-02-08 09:30:26.123+07     # +-HH
```
