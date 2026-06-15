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

// Build an Outlook web "new calendar event" deep link, pre-filled with the
// event details. Opening it lands the user directly in Outlook's built-in
// event composer (Office 365 / outlook.office.com) where they can add
// attendees and click Send — no .ics download/reopen step.
function buildOutlookEventUrl(ev) {
  var end = ev.start.clone().add(ev.durationMinutes || 60, "minutes");
  // ISO 8601 in UTC; Outlook renders it in the user's local timezone.
  var startISO = ev.start.clone().utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
  var endISO = end.clone().utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
  return (
    "https://outlook.office.com/calendar/0/deeplink/compose" +
    "?path=/calendar/action/compose&rru=addevent" +
    "&subject=" + encodeURIComponent(ev.subject || "") +
    "&startdt=" + encodeURIComponent(startISO) +
    "&enddt=" + encodeURIComponent(endISO) +
    "&location=" + encodeURIComponent(ev.location || "") +
    "&body=" + encodeURIComponent(ev.body || "")
  );
}

// Assemble a rich HTML description for the calendar invitation, pulling in as
// much conference detail as is available. Outlook's deep-link body renders as
// HTML (plain "\n" newlines are collapsed), so we use <b> for highlighted
// labels, <br> for line breaks, <hr> for dividers and <a> for clickable links.
// `c` is a plain object; empty fields and whole empty sections drop out. Ends
// with a source attribution back to this site.
function buildInviteBody(c) {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function row(label, value) { return "<b>" + label + ":</b> " + value; }
  function linkRow(label, url) {
    return row(label, '<a href="' + esc(url) + '">' + esc(url) + "</a>");
  }
  var BR = "<br>";
  var sections = [];

  // Deadlines.
  var dl = [];
  if (c.deadlineStr) dl.push(row("Submission deadline", esc(c.deadlineStr)));
  if (c.abstractStr) dl.push(row("Abstract deadline", esc(c.abstractStr)));
  if (dl.length) sections.push(dl.join(BR));

  // When / where / area.
  var det = [];
  if (c.dateStr) det.push(row("Dates", esc(c.dateStr)));
  if (c.place) det.push(row("Location", esc(c.place)));
  if (c.subs) det.push(row("Area", esc(c.subs)));
  if (det.length) sections.push(det.join(BR));

  // Links.
  var links = [];
  if (c.link) links.push(linkRow("Website", c.link));
  if (c.paperslink) links.push(linkRow("Accepted papers", c.paperslink));
  if (c.pwclink) links.push(linkRow("Papers with Code", c.pwclink));
  if (links.length) sections.push(links.join(BR));

  // Note (kept as-is — notes already contain valid <a> markup).
  if (c.note) sections.push(row("Note", String(c.note).replace(/\s+/g, " ").trim()));

  // Title + full name header, then the sections, then the source footer.
  var header = "<b>" + esc(c.title) + " " + esc(c.year) + "</b>";
  if (c.fullName) header += " &mdash; " + esc(c.fullName);
  var source =
    'Shared via <a href="' + esc(c.sourceUrl) + '"><b>AI Conference Deadlines</b></a>';

  return header + "<hr>" + sections.join(BR + BR) + "<hr>" + source;
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
