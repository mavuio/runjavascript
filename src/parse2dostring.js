var base_url = "twodo://x-callback-url/add?";

var get_params_from_text = function (txt) {
    var params = {
        task: txt
    };
    params = parse_for_priority(params);
    params = parse_for_star(params);

    params = parse_for_due_date(params);
    params = parse_for_start_date(params);

    params = parse_for_tags(params);

    params.task = params.task.trim()
    params.useQuickEntry = 1;
    return params;
};

var parse_for_priority = function (args) {
    var pattern = / p([0123])( |$)/g;
    var match;

    while ((match = pattern.exec(args.task)) !== null) {
        args.task = args.task.replace(pattern, " ");
        args.prio = match[1];
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
    console.log('#log', str);
    if ((found = str.match(/^([0-9]+)d?$/))) {
        return parseInt(found[1], 10) * 1;
    }
    if ((found = str.match(/^([0-9]+)w$/))) {
        return parseInt(found[1], 10) * 7;
    }
    if ((found = str.match(/^([0-9]+)m$/))) {
        return Math.round(parseInt(found[1], 10) * 30.5);
    }

    return str;
};

var parse_for_due_date = function (args) {
    var pattern = / [d!]([0-9]+[dwm]|mon|tue|wed|thu|fri|sat|sun|\d\d.\d\d.\d\d\d\d)( |$)/g;
    var match;

    while ((match = pattern.exec(args.task)) !== null) {
        args.task = args.task.replace(pattern, " ");
        args.due = parseDays(match[1]);
    }

    return args;
};

var parse_for_start_date = function (args) {
    var pattern = / [s?]([0-9]+[dwm]|mon|tue|wed|thu|fri|sat|sun|\d\d.\d\d.\d\d\d\d)( |$)/g;
    var match;

    while ((match = pattern.exec(args.task)) !== null) {
        args.task = args.task.replace(pattern, " ");
        args.start = parseDays(match[1]);
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
    var params = get_params_from_text(str);

    var url = base_url + serialize(params);

    return url;
};

url = get_twodo_url("rasen mähen dann p1 #anna #zeljko $star s1w d4m");
return url;
// url;
// console.log(url);

//   def parse_for_priority({str, params}) do
//
//   end

//
