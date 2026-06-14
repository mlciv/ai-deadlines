// Borrowed from https://github.com/moment/moment-timezone/issues/167
// Adds support for time zones 'UTC-12'..'UTC+12'
function addUtcTimeZones() {
  // Moment.js uses the IANA timezone database, which supports generic time zones like 'Etc/GMT+1'.
  // However, the signs for these time zones are inverted compared to ISO 8601.
  // For more details, see https://github.com/moment/moment-timezone/issues/167
  for (let offset = -12; offset <= 12; offset++) {
    const posixSign = offset <= 0 ? "+" : "-";
    const isoSign = offset >= 0 ? "+" : "-";
    const link = `Etc/GMT${posixSign}${Math.abs(
      offset
    )}|UTC${isoSign}${Math.abs(offset)}`;
    moment.tz.link(link);
  }
}

function update_filtering(data) {
  var page_url = "{{site.baseurl}}";
  store.set("{{site.domain}}-subs", data.subs);

  $(".ConfItem").hide();
  for (const j in data.all_subs) {
    const s = data.all_subs[j];
    const identifier = "." + s + "-conf";
    if (data.subs.includes(s)) {
      $(identifier).show();
    }
  }

  if (subs.length == 0) {
    window.history.pushState("", "", page_url);
  } else {
    window.history.pushState("", "", page_url + "/?sub=" + data.subs.join());
  }
}

// Build a proper .ics file as a Blob URL. The ouical library points its
// iCal/Outlook links at a `data:text/calendar` URL, which modern browsers
// block from navigating/downloading — so those links silently do nothing.
// A Blob URL + a `download` attribute downloads reliably.
function buildIcsBlobUrl(ev) {
  function fmt(m) { return m.clone().utc().format("YYYYMMDDTHHmmss") + "Z"; }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  }
  var end = ev.start.clone().add(ev.durationMinutes || 60, "minutes");
  var lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ai-deadlines//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + esc((ev.id || ev.title) + "-" + fmt(ev.start) + "@ai-deadlines"),
    "DTSTAMP:" + fmt(moment()),
    "DTSTART:" + fmt(ev.start),
    "DTEND:" + fmt(end),
    "SUMMARY:" + esc(ev.title),
    "DESCRIPTION:" + esc(ev.description),
    "LOCATION:" + esc(ev.location),
    "URL:" + esc(ev.url),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  var blob = new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  return URL.createObjectURL(blob);
}

// Repoint the iCal/Outlook download links inside a generated calendar widget
// at a working Blob-backed .ics download.
function fixIcsDownloads(calendarNode, ev, filename) {
  if (!calendarNode) return;
  var url = buildIcsBlobUrl(ev);
  ["a.icon-ical", "a.icon-outlook"].forEach(function (sel) {
    var a = calendarNode.querySelector(sel);
    if (a) {
      a.href = url;
      a.setAttribute("download", filename);
      a.removeAttribute("target");
    }
  });
}

function createCalendarFromObject(data) {
  return createCalendar({
    options: {
      class: "calendar-obj",

      // You can pass an ID. If you don't, one will be generated for you
      id: data.id,
    },
    data: {
      // Event title
      title: data.title,

      // Event start date
      start: data.date,

      // Event duration
      duration: 60,
    },
  });
}
