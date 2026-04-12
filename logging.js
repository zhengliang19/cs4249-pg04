// Adapted from http://web.mit.edu/6.813/www/sp18/assignments/as1-implementation/logging.js
//
// A simple Google-spreadsheet-based event logging framework.
//
// Add logging.js to your Web App to log standard input and custom events.
//
// This is currently set up to log every mousedown and keydown
// event, as well as any events that might be triggered within
// the app by triggering the 'log' event anywhere in the doc
// as follows:
//
// document.dispatchEvent(new CustomEvent('log', { detail: {
//   eventName: 'myevent',
//   info: {key1: val1, key2: val2}
// }}));

var ENABLE_NETWORK_LOGGING = true; // Controls network logging.
var ENABLE_CONSOLE_LOGGING = true; // Controls console logging.
var LOG_VERSION = '0.1';           // Labels every entry with version: "0.1".

// These event types are intercepted for logging before jQuery handlers.
var EVENT_TYPES_TO_LOG = {
  click: true
};

// These event properties are copied to the log if present.
var EVENT_PROPERTIES_TO_LOG = {
  which: true,
  pageX: true,
  pageY: true
};

// This function is called to record some global state on each event.
var GLOBAL_STATE_TO_LOG = function() {
  return {
  };
};

var loggingjs = (function() { // Immediately-Invoked Function Expression (IIFE); ref: http://benalman.com/news/2010/11/immediately-invoked-function-expression/

// A persistent unique id for the user.
var uid = getUniqueId();
var pageLoadTime = (new Date).getTime();

// Hooks up all the event listeners.
function hookEventsToLog() {
  // Set up low-level event capturing.  This intercepts all
  // native events before they bubble, so we log the state
  // *before* normal event processing.
  for (var event_type in EVENT_TYPES_TO_LOG) {
    if (EVENT_TYPES_TO_LOG[event_type]) {
      document.addEventListener(event_type, logEvent, true);
    }
  }
}

// Returns a CSS selector that is descriptive of
// the element, for example, "td.left div" for
// a class-less div within a td of class "left".
function elementDesc(elt) {
  if (elt == document) {
    return 'document';
  } else if (elt == window) {
    return 'window';
  }
  function descArray(elt) {
    var desc = [elt.tagName.toLowerCase()];
    if (elt.id) {
      desc.push('#' + elt.id);
    }
    for (var j = 0; j < elt.classList.length; j++) {
      desc.push('.' + elt.classList[j]);
    }
    return desc;
  }
  var desc = [];
  while (elt && desc.length <= 1) {
    var desc2 = descArray(elt);
    if (desc.length == 0) {
      desc = desc2;
    } else if (desc2.length > 1) {
      desc2.push(' ', desc[0]);
      desc = desc2;
    }
    elt = elt.parentElement;
  }
  return desc.join('');
}

// Parse user agent string by looking for recognized substring.
function findFirstString(str, choices) {
  for (var j = 0; j < choices.length; j++) {
    if (str.indexOf(choices[j]) >= 0) {
      return choices[j];
    }
  }
  return '?';
}

// Generates or remembers a somewhat-unique ID with distilled user-agent info.
function getUniqueId() {
  if (!('uid' in localStorage)) {
    var browser = findFirstString(navigator.userAgent, [
      'Seamonkey', 'Firefox', 'Chromium', 'Chrome', 'Safari', 'OPR', 'Opera',
      'Edge', 'MSIE', 'Blink', 'Webkit', 'Gecko', 'Trident', 'Mozilla']);
    var os = findFirstString(navigator.userAgent, [
      'Android', 'iOS', 'Symbian', 'Blackberry', 'Windows Phone', 'Windows',
      'OS X', 'Linux', 'iOS', 'CrOS']).replace(/ /g, '_');
    var unique = ('' + Math.random()).substr(2);
    localStorage['uid'] = os + '-' + browser + '-' + unique;
  }
  return localStorage['uid'];
}

// Log the given event.
function logEvent(event, customName, customInfo) {
  var detail = event && event.detail ? event.detail : null;
  var timestamp = (new Date).getTime();
  var userId = window.USER_ID || uid;
  var eventName = customName ||
    (detail && detail.eventName) ||
    (event && event.type) ||
    'custom';
  var eventType = (customInfo && customInfo.event_type) ||
    (detail && detail.event_type) ||
    (event && event.type) ||
    'custom';
  // By default, monitor some global state on every event.
  var infoObj = GLOBAL_STATE_TO_LOG();
  // And monitor a few interesting fields from the event, if present.
  for (var key in EVENT_PROPERTIES_TO_LOG) {
    if (event && key in event) {
      infoObj[key] = event[key];
    }
  }
  // Support CustomEvent payloads dispatched from the page.
  if (detail && detail.info && typeof detail.info === 'object') {
    infoObj = Object.assign(infoObj, detail.info);
  }
  // Let a custom event add fields to the info.
  if (customInfo) {
    infoObj = Object.assign(infoObj, customInfo);
  }
  infoObj.elapsed_ms = timestamp - pageLoadTime;
  var trialId = window.TRIAL_ID || window.trial_id || '';
  var systemType = window.SYSTEM_TYPE || window.system_type || '';
  var userType = window.USER_TYPE || window.user_type || '';
  var target = event ? elementDesc(event.target) : 'document';
  var additionalData = JSON.stringify({
    target: target,
    info: infoObj
  });

  if (ENABLE_CONSOLE_LOGGING) {
    console.log(
      timestamp,
      userId,
      trialId,
      systemType,
      userType,
      eventName,
      eventType,
      additionalData
    );
  }
  if (ENABLE_NETWORK_LOGGING) {
    sendNetworkLog(
      timestamp,
      userId,
      trialId,
      systemType,
      userType,
      eventName,
      eventType,
      additionalData
    );
  }
}

// OK, go.
if (ENABLE_NETWORK_LOGGING) {
  hookEventsToLog();
}

// module pattern to allow some key functions to be "public"
return {
	logEvent
};

}());

/////////////////////////////////////////////////////////////////////////////
// CHANGE ME:
// ** Replace the function below by substituting your own google form. **
/////////////////////////////////////////////////////////////////////////////
//
// 1. Create a Google form called "Network Log" at forms.google.com.
// 2. Set it up to have several "short answer" questions; here we assume
//    eight questions: timestamp, user_id, trial_id, system_type, user_type,
//    event_name, event_type, additional_data.
// 3. Run googlesender.py to make a javascript
//    function that submits records directly to the form.
// 4. Put that function in here, and replace the current sendNetworkLog
//    so that your version is called to log events to your form.
//
// For example, the following code was written as follows:
// python googlesender.py https://docs.google.com/forms/d/e/1.../viewform
//
// This preocess changes the ids below to direct your data into your own
// form and spreadsheet. The formid must be customized, and also the form
// field names such as "entry.1291686978" must be matched to your form.
// (The numerical field names for a Google form can be found by inspecting
// the form input fields.) This can be done manually, but since this is an
// error-prone process, it can be easier to use googlesender.py.
//
/////////////////////////////////////////////////////////////////////////////

function sendNetworkLog(
    timestamp,
    user_id,
    trial_id,
    system_type,
    user_type,
    event_name,
    event_type,
    additional_data) {
  var formid = "e/1FAIpQLSerp5Wa-1b0uTwmh6PjK_kXB2T3Shfr1DHNb5mG49rBT_04Gw";
  var data = {
    "entry.1625930275": timestamp,
    "entry.1898047994": user_id,
    "entry.1103224891": trial_id,
    "entry.2145999211": system_type,
    "entry.1319259069": user_type,
    "entry.1533424249": event_name,
    "entry.1660296036": event_type,
    "entry.1940967186": additional_data
  };
  var params = [];
  for (var key in data) {
    params.push(key + "=" + encodeURIComponent(data[key]));
  }
  // Submit the form using an image to avoid CORS warnings; warning may still happen, but log will be sent. Go check result in Google Form
  (new Image).src = "https://docs.google.com/forms/d/" + formid +
     "/formResponse?" + params.join("&");
}
