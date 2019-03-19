var base_url_osx = "x-fantastical2://parse?";

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

var getDatePlus = function (days_plus) {

  var currDate = new Date();
  return new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + days_plus);


}

var lastFoundDay = null;

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
  var dayInMill = 1000 * 60 * 60 * 24;
  var currDate = new Date();
  if (lastFoundDay) {
    currDate = lastFoundDay;
  } else {
    currDate = new Date(currDate.getTime() + dayInMill); //start with tomorrow 
  }
  var currTimestamp = currDate.getTime();
  var triggerDay = days[refday];
  var dayMillDiff = 0;
  // add a day to dayMillDiff as long as the desired refday (sunday for instance) is not reached
  while (currDate.getDay() != triggerDay) {
    dayMillDiff += dayInMill;
    currDate = new Date(currDate.getTime() + dayInMill);
  }
  lastFoundDay = new Date(currTimestamp + dayMillDiff);
  return lastFoundDay;
};

var get_params_from_text = function (txt) {
  var params = {
    sentence: txt
  };
  // params = parse_for_priority(params);
  // params = parse_for_star(params);

  params = parse_for_start_date(params);
  if (params.start) {
    params = parse_for_end_date(params);
  }

  params = parse_for_list(params);
  params = parse_for_endlocation(params);
  params = parse_for_location(params);

  params.sentence = params.sentence.trim();
  return params;
};



var parseDays = function (str) {
  console.log("#parseDays", str);

  var days_plus = null;
  if ((found = str.match(/^([0-9]+)d?$/))) {
    days_plus = parseInt(found[1], 10) * 1;
  }
  if ((found = str.match(/^([0-9]+)w$/))) {
    days_plus = parseInt(found[1], 10) * 7;
  }
  if ((found = str.match(/^([0-9]+)m$/))) {
    days_plus = Math.round(parseInt(found[1], 10) * 30.5);
  }

  if (days_plus !== null) {
    return formatDate(getDatePlus(days_plus))
  }
  if ((found = str.match(/^(mon|tue|wed|thu|fri|sat|sun)$/))) {
    return formatDate(getDateOfWeekday(found[1]));
  }

  if ((found = str.match(/^(\d?\d\.)(\d?\d\.)?(\d\d(\d\d)?)?$/))) {
    return parsePartialDate(str);
  }

  return str;
};

var parse_for_list = function (args) {
  var pattern = /(^| )[#$/]([a-z0-9]+)/g;

  if ((match = pattern.exec(args.sentence)) !== null) {
    args.list = match[2];
    args.sentence = args.sentence.replace(pattern, " ");
  }
  return args;
};

var parse_for_location = function (args) {
  var pattern = /(^| )[@]([a-z0-9]+)/g;
  console.log('parse_for_location', args.sentence);

  if ((match = pattern.exec(args.sentence)) !== null) {
    args.location = match[2];
    args.sentence = args.sentence.replace(pattern, " ");
  }
  return args;
};

var parse_for_endlocation = function (args) {
  var pattern = / @(.+)$/g;


  if ((match = pattern.exec(args.sentence)) !== null) {
    args.location = match[1];
    args.sentence = args.sentence.replace(pattern, " ");
  }
  return args;
};

var parse_for_start_date = function (args) {
  lastFoundDay = null;
  var pattern = /(at |on |in |from | |^)([0-9]+[dwm]?|mon|tue|wed|thu|fri|sat|sun|(\d?\d\.)(\d?\d\.)?(\d\d(\d\d)?)?)(-| |$)/g;
  var match;

  while ((match = pattern.exec(args.sentence)) !== null) {
    args.sentence = args.sentence.replace(pattern, match[7]);
    args.start = parseDays(match[2]);
  }

  return args;
};

var parse_for_end_date = function (args) {
  var pattern = /( to |-)([0-9]+[dwm]?|mon|tue|wed|thu|fri|sat|sun|(\d?\d\.)(\d?\d\.)?(\d\d(\d\d)?)?)( |$)/g;
  var match;

  while ((match = pattern.exec(args.sentence)) !== null) {
    args.sentence = args.sentence.replace(pattern, " ");
    args.end = parseDays(match[2]);
    if (args.end && args.end.match(/^\d\d\d\d-\d\d-\d\d$/)) {
      args.end = args.end;
    }
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

var get_calendar_url = function (str) {
  var lines = str.split(/\n/);
  var sentence = lines[0];
  var note = null;
  if (lines.length > 2 && lines[1] == "") {
    note = lines.slice(2, lines.length).join("\n");
  }

  var params = get_params_from_text(sentence);
  if (note) {
    params.note = note;
  }
  var s = get_sentence_from_params(params);
  var url = base_url_osx + serialize({
    s: s
  });

  return url;
};

function get_sentence_from_params(params) {

  var sentence = params.sentence
  if (params.start) {
    sentence += " " + params.start;
  }

  if (params.end) {
    sentence += " " + params.end;
  }

  if (params.list) {
    sentence += " /" + params.list;
  }

  if (params.location) {
    sentence += " @" + params.location;
  }
  return sentence;
};

function run(argv) {
  var str = argv[0];

  return get_calendar_url(str);
}

if (typeof runjs !== "undefined") {
  var str = runjs.getInput().text();
  var url = get_calendar_url(str);
  runjs.callBack(url);
}

// ret = get_calendar_url("@home meeting mit doris in 1d ");
// ret

// ret2 = get_calendar_url("/inter meeting mit doris from tue to fri @Gumpendorferstrasse 132/1/9");
// ret2

// ret2 = get_calendar_url("meeting mit doris from tue-fri /h");
// ret2
