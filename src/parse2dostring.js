var base_url = "twodo://x-callback-url/add?";

var formatDate = function (date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

function parsePartialDate(str) {
  str;

  //format dd. or dd.mm. or dd.mm.yyyy
  console.log("parsePartialDate", str);

  if (str.indexOf(".") < 1) {
    str = str.substr(0, 2) + "." + str.substr(2, 2) + "." + str.substr(4);
  }

  var date_arr = str.split(".");
  var day = date_arr[0];
  var month = date_arr[1];
  var year = date_arr[2] * 1;
  var ok = false;

  day;
  month;
  year;
  if (!month) {
    today = new Date();
    aktmonth = today.getMonth() + 1;
    aktyear = today.getFullYear();
    month = aktmonth;
    var test = new Date(aktyear, month - 1, day);
    // if date would be to old:

    if (test.getTime() < today.getTime()) {
      month++;
    }
    month;
  }

  if (!year) {
    today = new Date();
    aktyear = today.getFullYear();
    year = aktyear;
    var test = new Date(year, month - 1, day);
    // if date would be to old:
    if (test.getTime() < today.getTime() - 3600000 * 24 * 30) {
      year++;
    }
  }

  if (year < 90) {
    year = year * 1 + 2000;
  }

  var ret = formatDate(new Date(year, month - 1, day));
  console.log("=", ret);
  return ret;
}

var getDateOfWeekday = function (refday) {
  var days = {
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
    sun: 0
  };
  if (!days.hasOwnProperty(refday))
    throw new Error(refday + " is not listed in " + JSON.stringify(days));
  var currDate = new Date();
  var dayInMill = 1000 * 60 * 60 * 24;
  currDate = new Date(currDate.getTime() + dayInMill); //start with tomorrow
  var currTimestamp = currDate.getTime();
  var triggerDay = days[refday];
  var dayMillDiff = 0;
  // add a day to dayMillDiff as long as the desired refday (sunday for instance) is not reached
  while (currDate.getDay() != triggerDay) {
    dayMillDiff += dayInMill;
    currDate = new Date(currDate.getTime() + dayInMill);
  }
  return new Date(currTimestamp + dayMillDiff);
};

var get_params_from_text = function (txt) {
  var params = {
    task: txt
  };
  params = parse_for_priority(params);
  params = parse_for_star(params);

  params = parse_for_start_date(params);
  params = parse_for_due_date(params);

  params = parse_for_tags(params);

  params.task = params.task.trim();
  params.useQuickEntry = 1;
  return params;
};

var parse_for_priority = function (args) {
  var pattern = / p([0123])( |$)/g;
  var match;

  while ((match = pattern.exec(args.task)) !== null) {
    args.task = args.task.replace(pattern, " ");
    args.priority = match[1];
  }

  return args;
};

var parse_for_star = function (args) {
  var pattern = / [#$]?star( |$)/g;
  var match;

  while ((match = pattern.exec(args.task)) !== null) {
    args.task = args.task.replace(pattern, " ");
    args.starred = 1;
  }

  return args;
};

var parseDays = function (str) {
  console.log("#parseDays", str);

  if ((found = str.match(/^([0-9]+)d?$/))) {
    return parseInt(found[1], 10) * 1;
  }
  if ((found = str.match(/^([0-9]+)w$/))) {
    return parseInt(found[1], 10) * 7;
  }
  if ((found = str.match(/^([0-9]+)m$/))) {
    return Math.round(parseInt(found[1], 10) * 30.5);
  }

  if ((found = str.match(/^(mon|tue|wed|thu|fri|sat|sun)$/))) {
    return formatDate(getDateOfWeekday(found[1]));
  }

  if ((found = str.match(/^(\d?\d\.)(\d?\d\.)?(\d\d(\d\d)?)?$/))) {
    return parsePartialDate(str);
  }

  return str;
};

var parse_for_due_date = function (args) {
  var pattern = / [d!]([0-9]+[dwm]?|mon|tue|wed|thu|fri|sat|sun|(\d?\d\.)(\d?\d\.)?(\d\d(\d\d)?)?)( |$)/g;
  var match;

  while ((match = pattern.exec(args.task)) !== null) {
    args.task = args.task.replace(pattern, " ");
    args.due = parseDays(match[1]);
  }

  return args;
};

var parse_for_start_date = function (args) {
  var pattern = / [ks?]([0-9]+[dwm]?|mon|tue|wed|thu|fri|sat|sun|(\d?\d\.)(\d?\d\.)?(\d\d(\d\d)?)?)( |$)/g;
  var match;

  while ((match = pattern.exec(args.task)) !== null) {
    args.task = args.task.replace(pattern, " ");
    args.start = parseDays(match[1]) + "";
    if (args.start && args.start.match(/^\d\d\d\d-\d\d-\d\d$/)) {
      args.start = args.start + " 00:00";
    }
  }

  return args;
};

var parse_for_tags = function (args) {
  var pattern = / [#$]([a-z0-9]+)/g;

  var tags = [];
  while ((match = pattern.exec(args.task)) !== null) {
    tags.push(match[1]);
  }

  if (tags.length > 0) {
    args.task = args.task.replace(pattern, " ");
    args.tags = tags.join(",");
  }
  return args;
};

var serialize = function (obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

var get_twodo_url = function (str) {
  var lines = str.split(/\n/);
  var task = lines[0];
  var note = null;
  if (lines.length > 2 && lines[1] == "") {
    note = lines.slice(2, lines.length).join("\n");
  }

  var params = get_params_from_text(task);
  if (note) {
    params.note = note;
  }
  var url = base_url + serialize(params);

  return url;
};

function run(argv) {
  var str = argv[0];

  return get_twodo_url(str);
}

if (typeof runjs !== "undefined") {
  var str = runjs.getInput().text();
  var url = get_twodo_url(str);
  runjs.callBack(url);
}

// ret = get_twodo_url("more !1? meine notes");
// ret
