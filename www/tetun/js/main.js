(function ($) {
  // Detect touch support
  $.support.touch = "ontouchend" in document;
  // Ignore browsers without touch support
  if (!$.support.touch) {
    return;
  }
  var mouseProto = $.ui.mouse.prototype,
    _mouseInit = mouseProto._mouseInit,
    touchHandled;

  function simulateMouseEvent(event, simulatedType) {
    //use this function to simulate mouse event
    // Ignore multi-touch events
    if (event.originalEvent.touches.length > 1) {
      return;
    }
    event.preventDefault(); //use this to prevent scrolling during ui use

    var touch = event.originalEvent.changedTouches[0],
      simulatedEvent = document.createEvent("MouseEvents");
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(
      simulatedType, // type
      true, // bubbles
      true, // cancelable
      window, // view
      1, // detail
      touch.screenX, // screenX
      touch.screenY, // screenY
      touch.clientX, // clientX
      touch.clientY, // clientY
      false, // ctrlKey
      false, // altKey
      false, // shiftKey
      false, // metaKey
      0, // button
      null, // relatedTarget
    );

    // Dispatch the simulated event to the target element
    event.target.dispatchEvent(simulatedEvent);
  }
  mouseProto._touchStart = function (event) {
    var self = this;
    // Ignore the event if another widget is already being handled
    if (
      touchHandled ||
      !self._mouseCapture(event.originalEvent.changedTouches[0])
    ) {
      return;
    }
    // Set the flag to prevent other widgets from inheriting the touch event
    touchHandled = true;
    // Track movement to determine if interaction was a click
    self._touchMoved = false;
    // Simulate the mouseover event
    simulateMouseEvent(event, "mouseover");
    // Simulate the mousemove event
    simulateMouseEvent(event, "mousemove");
    // Simulate the mousedown event
    simulateMouseEvent(event, "mousedown");
  };

  mouseProto._touchMove = function (event) {
    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }
    // Interaction was not a click
    this._touchMoved = true;
    // Simulate the mousemove event
    simulateMouseEvent(event, "mousemove");
  };
  mouseProto._touchEnd = function (event) {
    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }
    // Simulate the mouseup event
    simulateMouseEvent(event, "mouseup");
    // Simulate the mouseout event
    simulateMouseEvent(event, "mouseout");
    // If the touch interaction did not move, it should trigger a click
    if (!this._touchMoved) {
      // Simulate the click event
      simulateMouseEvent(event, "click");
    }
    // Unset the flag to allow other widgets to inherit the touch event
    touchHandled = false;
  };
  mouseProto._mouseInit = function () {
    var self = this;
    // Delegate the touch handlers to the widget's element
    self.element
      .on("touchstart", $.proxy(self, "_touchStart"))
      .on("touchmove", $.proxy(self, "_touchMove"))
      .on("touchend", $.proxy(self, "_touchEnd"));

    // Call the original $.ui.mouse init method
    _mouseInit.call(self);
  };
})(jQuery);

function doGetParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function doRedirectToURL(rObj, rAction) {
  var rNavURL = "";
  if (rObj.style.cursor == "pointer") {
    switch (rAction.toUpperCase()) {
      case "H":
        rNavURL = rHomeURL;
        break;
      case "P":
        rNavURL = rPreviousActURL;
        break;
      case "N":
        rNavURL = rNextActURL;
        break;
      default:
        break;
    }
    document.location.href = rNavURL;
  }
}

function doResetMainNavButton() {
  document.getElementById("divBtnHome").style.zIndex = 9999;
  document.getElementById("divBtnBackArrow").style.zIndex = 9999;
  document.getElementById("divBtnNextArrow").style.zIndex = 9999;
  if (
    document.getElementById("divBtnPanel") != null &&
    document.getElementById("divBtnPanel") != undefined &&
    document.getElementById("divBtnPanel") != ""
  ) {
    document.getElementById("divBtnPanel").style.zIndex = 9999;
  }
  if (
    document.getElementById("divBtnPanel") != null &&
    document.getElementById("divBtnBack") != undefined &&
    document.getElementById("divBtnBack") != ""
  ) {
    document.getElementById("divBtnBack").style.zIndex = 9999;
  }
  if (
    document.getElementById("divBtnReplay") != null &&
    document.getElementById("divBtnReplay") != undefined &&
    document.getElementById("divBtnReplay") != ""
  ) {
    document.getElementById("divBtnReplay").style.zIndex = 9999;
  }
  if (
    document.getElementById("divBtnNext") != null &&
    document.getElementById("divBtnNext") != undefined &&
    document.getElementById("divBtnNext") != ""
  ) {
    document.getElementById("divBtnNext").style.zIndex = 9999;
  }

  if (rPreviousActURL == "" && rNextActURL == "") {
    document.getElementById("divBtnBackArrow").style.display = "none";
    document.getElementById("divBtnNextArrow").style.display = "none";
  } else {
    if (rPreviousActURL == "" && rNextActURL != "") {
      document.getElementById("divBtnBackArrow").style.display = "none";
      document.getElementById("divBtnNextArrow").style.display = "inline-block";
    } else {
      if (rPreviousActURL != "" && rNextActURL == "") {
        document.getElementById("divBtnBackArrow").style.display =
          "inline-block";
        document.getElementById("divBtnNextArrow").style.display = "none";
      } else {
        if (rPreviousActURL != "" && rNextActURL != "") {
          document.getElementById("divBtnBackArrow").style.display =
            "inline-block";
          document.getElementById("divBtnNextArrow").style.display =
            "inline-block";
        }
      }
    }
  }

  var rLen = 0;
  var rCheckWidth = 0;
  var rCheckHeight = 0;
  if (document.getElementById("divContainer") == null) {
    rCheckWidth = document.getElementById("divWrapper").style.width;
    rCheckHeight = document.getElementById("divWrapper").style.height;
  } else {
    rCheckWidth = document.getElementById("divContainer").style.width;
    rCheckHeight = document.getElementById("divContainer").style.height;
  }
  //doMacroBtnSizeAndAlignment();
}

var rDocumentURL = window.location.href;
var rActBaseURL = rDocumentURL.split("/tetun/")[0];
var rDocumentURLSpl = rDocumentURL.split("?");
var rTempURL = rDocumentURLSpl[0];
var rTempURLSpl = rTempURL.split("/tetun/");
var rTempDocumentURL = rTempURLSpl[1];

rStrMainActivityList = doGetParameterByName("MainActivityList");

rArrMainActivityList = [];
if (
  rStrMainActivityList != null &&
  rStrMainActivityList != undefined &&
  rStrMainActivityList != ""
) {
  rArrMainActivityList = rStrMainActivityList.split("~");
}

var rHomeURL = "";
var rPreviousActURL = "";
var rNextActURL = "";
var rMainActivityListIndex = -1;

if (rArrMainActivityList.length <= 1) {
  rPreviousActURL = "";
  rNextActURL = "";
} else {
  for (var i = 0; i < rArrMainActivityList.length; i++) {
    if (
      rArrMainActivityList[i].toLowerCase().trim() ==
      rTempDocumentURL.toLowerCase().trim()
    ) {
      rMainActivityListIndex = i;
      break;
    }
  }
}
rPreviousActURL =
  rActBaseURL +
  "/tetun/" +
  rArrMainActivityList[rMainActivityListIndex - 1] +
  "?MainActivityList=" +
  rStrMainActivityList;
rNextActURL =
  rActBaseURL +
  "/tetun/" +
  rArrMainActivityList[rMainActivityListIndex + 1] +
  "?MainActivityList=" +
  rStrMainActivityList;
rHomeURL = rActBaseURL + "/tetun/index.html";

if (rMainActivityListIndex <= 0) {
  rPreviousActURL = "";
} else {
  if (rMainActivityListIndex + 1 > rArrMainActivityList.length - 1) {
    rNextActURL = "";
  } else {
    rPreviousActURL =
      rActBaseURL +
      "/tetun/" +
      rArrMainActivityList[rMainActivityListIndex - 1] +
      "?MainActivityList=" +
      rStrMainActivityList;
    rNextActURL =
      rActBaseURL +
      "/tetun/" +
      rArrMainActivityList[rMainActivityListIndex + 1] +
      "?MainActivityList=" +
      rStrMainActivityList;
  }
}

if (rArrMainActivityList.length == 1) {
  rPreviousActURL = "";
  rNextActURL = "";
}

var rDocumentURL = window.location.href;
var rDocumentURLSpl = rDocumentURL.split("?");
var rDocumentBaseURL = rDocumentURLSpl[0];

var rBodyZoomLevel = "";
function doMacroBtnSizeAndAlignment() {
  rBodyZoomLevel = document.body.style.zoom;
  if (
    rBodyZoomLevel == null ||
    rBodyZoomLevel == undefined ||
    rBodyZoomLevel == ""
  ) {
    if (
      document.getElementById("divBtnPanel") != null &&
      document.getElementById("divBtnPanel") != undefined &&
      document.getElementById("divBtnPanel") != ""
    ) {
      rLen = 0;
      document.getElementById("divBtnPanel").style.top = "265px";
      rLen = document
        .getElementById("divBtnPanel")
        .getElementsByTagName("img").length;
      for (var i = 0; i < rLen; i++) {
        if (
          document.getElementById("divBtnPanel").getElementsByTagName("img")[
            i
          ] != null
        ) {
          document.getElementById("divBtnPanel").getElementsByTagName("img")[
            i
          ].style.width = "auto";
          document.getElementById("divBtnPanel").getElementsByTagName("img")[
            i
          ].style.height = "40px";
        }
      }
    }

    if (
      document.getElementById("divBtnWBPNPanel") != null &&
      document.getElementById("divBtnWBPNPanel") != undefined &&
      document.getElementById("divBtnWBPNPanel") != ""
    ) {
      rLen = 0;
      document.getElementById("divBtnWBPNPanel").style.top = "265px";
      rLen = document
        .getElementById("divBtnWBPNPanel")
        .getElementsByTagName("img").length;
      for (var i = 0; i < rLen; i++) {
        if (
          document
            .getElementById("divBtnWBPNPanel")
            .getElementsByTagName("img")[i] != null
        ) {
          document
            .getElementById("divBtnWBPNPanel")
            .getElementsByTagName("img")[i].style.width = "auto";
          document
            .getElementById("divBtnWBPNPanel")
            .getElementsByTagName("img")[i].style.height = "40px";
        }
      }
    }

    if (
      document.getElementById("divMacroBtnNavPanel") != null &&
      document.getElementById("divMacroBtnNavPanel") != undefined &&
      document.getElementById("divMacroBtnNavPanel") != ""
    ) {
      document.getElementById("divMacroBtnNavPanel").style.top = "-5px";
      document.getElementById("divMacroBtnNavPanel").style.right = "-2px";
      document.getElementById("divMacroBtnNavPanel").style.border =
        "0px solid green";

      if (
        document.getElementById("divPosterImage") != null ||
        document.getElementById("divPosterImage") != undefined ||
        document.getElementById("divPosterImage") == ""
      ) {
        document.getElementById("divPosterImage").style.top = "10px";
        document
          .getElementById("divPosterImage")
          .getElementsByTagName("img")[0].style.width = "auto";
        document
          .getElementById("divPosterImage")
          .getElementsByTagName("img")[0].style.height = "45px";
      }
      if (
        document.getElementById("divBtnBackArrow") != null ||
        document.getElementById("divBtnBackArrow") != undefined ||
        document.getElementById("divBtnBackArrow") == ""
      ) {
        document.getElementById("divBtnBackArrow").style.top = "75px";
        document
          .getElementById("divBtnBackArrow")
          .getElementsByTagName("img")[0].style.width = "auto";
        document
          .getElementById("divBtnBackArrow")
          .getElementsByTagName("img")[0].style.height = "45px";
      }
      if (
        document.getElementById("divBtnNextArrow") != null ||
        document.getElementById("divBtnNextArrow") != undefined ||
        document.getElementById("divBtnNextArrow") == ""
      ) {
        document.getElementById("divBtnNextArrow").style.top = "125px";
        document
          .getElementById("divBtnNextArrow")
          .getElementsByTagName("img")[0].style.width = "auto";
        document
          .getElementById("divBtnNextArrow")
          .getElementsByTagName("img")[0].style.height = "45px";
      }
      if (
        document.getElementById("divBtnHome") != null ||
        document.getElementById("divBtnHome") != undefined ||
        document.getElementById("divBtnHome") == ""
      ) {
        document.getElementById("divBtnHome").style.top = "215px";
        document
          .getElementById("divBtnHome")
          .getElementsByTagName("img")[0].style.width = "auto";
        document
          .getElementById("divBtnHome")
          .getElementsByTagName("img")[0].style.height = "100px";
      }
    }
  }
  if (rBodyZoomLevel == "43%") {
    if (
      document.getElementById("divBtnPanel") != null &&
      document.getElementById("divBtnPanel") != undefined &&
      document.getElementById("divBtnPanel") != ""
    ) {
      rLen = 0;
      document.getElementById("divBtnPanel").style.top = "635px";
      rLen = document
        .getElementById("divBtnPanel")
        .getElementsByTagName("img").length;
      for (var i = 0; i < rLen; i++) {
        if (
          document.getElementById("divBtnPanel").getElementsByTagName("img")[
            i
          ] != null
        ) {
          document.getElementById("divBtnPanel").getElementsByTagName("img")[
            i
          ].style.width = "auto";
          document.getElementById("divBtnPanel").getElementsByTagName("img")[
            i
          ].style.height = "80px";
        }
      }
    }

    if (
      document.getElementById("divBtnWBPNPanel") != null &&
      document.getElementById("divBtnWBPNPanel") != undefined &&
      document.getElementById("divBtnWBPNPanel") != ""
    ) {
      rLen = 0;
      document.getElementById("divBtnWBPNPanel").style.top = "635px";
      rLen = document
        .getElementById("divBtnWBPNPanel")
        .getElementsByTagName("img").length;
      for (var i = 0; i < rLen; i++) {
        if (
          document
            .getElementById("divBtnWBPNPanel")
            .getElementsByTagName("img")[i] != null
        ) {
          document
            .getElementById("divBtnWBPNPanel")
            .getElementsByTagName("img")[i].style.width = "auto";
          document
            .getElementById("divBtnWBPNPanel")
            .getElementsByTagName("img")[i].style.height = "80px";
        }
      }
    }

    if (
      document.getElementById("divMacroBtnNavPanel") != null &&
      document.getElementById("divMacroBtnNavPanel") != undefined &&
      document.getElementById("divMacroBtnNavPanel") != ""
    ) {
      document.getElementById("divMacroBtnNavPanel").style.width = "120px";
      document.getElementById("divMacroBtnNavPanel").style.top = "0px";
      document.getElementById("divMacroBtnNavPanel").style.right = "5px";
      document.getElementById("divMacroBtnNavPanel").style.border =
        "0px solid green";

      if (
        document.getElementById("divPosterImage") != null ||
        document.getElementById("divPosterImage") != undefined ||
        document.getElementById("divPosterImage") == ""
      ) {
        document.getElementById("divPosterImage").style.top = "10px";
        document
          .getElementById("divPosterImage")
          .getElementsByTagName("img")[0].style.width = "auto";
        document
          .getElementById("divPosterImage")
          .getElementsByTagName("img")[0].style.height = "105px";
      }
      if (
        document.getElementById("divBtnBackArrow") != null ||
        document.getElementById("divBtnBackArrow") != undefined ||
        document.getElementById("divBtnBackArrow") == ""
      ) {
        document.getElementById("divBtnBackArrow").style.top = "125px";
        document
          .getElementById("divBtnBackArrow")
          .getElementsByTagName("img")[0].style.width = "auto";
        document
          .getElementById("divBtnBackArrow")
          .getElementsByTagName("img")[0].style.height = "95px";
      }
      if (
        document.getElementById("divBtnNextArrow") != null ||
        document.getElementById("divBtnNextArrow") != undefined ||
        document.getElementById("divBtnNextArrow") == ""
      ) {
        document.getElementById("divBtnNextArrow").style.top = "220px";
        document
          .getElementById("divBtnNextArrow")
          .getElementsByTagName("img")[0].style.width = "auto";
        document
          .getElementById("divBtnNextArrow")
          .getElementsByTagName("img")[0].style.height = "95px";
      }
      if (
        document.getElementById("divBtnHome") != null ||
        document.getElementById("divBtnHome") != undefined ||
        document.getElementById("divBtnHome") == ""
      ) {
        document.getElementById("divBtnHome").style.top = "525px";
        document
          .getElementById("divBtnHome")
          .getElementsByTagName("img")[0].style.width = "auto";
        document
          .getElementById("divBtnHome")
          .getElementsByTagName("img")[0].style.height = "200px";
      }
    }
  }
}

var rTempDocHref = document.location.href;
var rTempSPL = rTempDocHref.split("?");
var rFirstPartURL = "";
var rSecondPartURL = "";
var rTempPosterImageURL = "";
var rTempPosterImageBackURL = "";

function doSetPosterIconAndURL() {
  if (
    document.getElementById("divMacroBtnNavPanel") != null &&
    document.getElementById("divMacroBtnNavPanel") != undefined &&
    document.getElementById("divMacroBtnNavPanel") != ""
  ) {
    document.getElementById("divMacroBtnNavPanel").style.zIndex = 5000;
  }
  rFirstPartURL = rTempSPL[0];
  rSecondPartURL = rTempSPL[1];
  /*My Self Begin*/
  if (rTempDocHref.indexOf("myself") >= 0) {
    if (rFirstPartURL.indexOf("activities") >= 0) {
      if (
        rFirstPartURL.indexOf(
          "activities/myself_photo/activity_photo/activity.html",
        ) >= 0
      ) {
        rTempPosterImageURL =
          "../../../images/activity_macro_static_images/myself.png";
        rTempPosterImageBackURL = "../../../theme_myself_level_2.html";
      } else {
        rTempPosterImageURL =
          "../../images/activity_macro_static_images/myself.png";
        rTempPosterImageBackURL = "../../theme_myself_level_2.html";
      }
      doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
    }
  }
  /*My Self End*/

  /*Transport Begin*/
  if (rTempDocHref.indexOf("transport") >= 0) {
    if (rFirstPartURL.indexOf("activities") >= 0) {
      if (
        rFirstPartURL.indexOf(
          "activities/transport_photo/activity_photo/activity.html",
        ) >= 0
      ) {
        rTempPosterImageURL =
          "../../../images/activity_macro_static_images/transport.png";
        rTempPosterImageBackURL = "../../../theme_transport_level_2.html";
      } else {
        rTempPosterImageURL =
          "../../images/activity_macro_static_images/transport.png";
        rTempPosterImageBackURL = "../../theme_transport_level_2.html";
      }
      doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
    }
  }
  /*Transport End*/

  /*Celebration Begin*/
  if (rTempDocHref.indexOf("celebration") >= 0) {
    if (rFirstPartURL.indexOf("activities") >= 0) {
      if (
        rFirstPartURL.indexOf(
          "activities/celebration_photo/activity_photo/activity.html",
        ) >= 0
      ) {
        rTempPosterImageURL =
          "../../../images/activity_macro_static_images/celebration.png";
        rTempPosterImageBackURL = "../../../theme_celebration_level_2.html";
      } else {
        rTempPosterImageURL =
          "../../images/activity_macro_static_images/celebration.png";
        rTempPosterImageBackURL = "../../theme_celebration_level_2.html";
      }
      doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
    }
  }
  /*Celebration End*/

  /*Community Begin*/
  if (rTempDocHref.indexOf("community") >= 0) {
    if (rFirstPartURL.indexOf("activities") >= 0) {
      if (
        rFirstPartURL.indexOf(
          "activities/community_photo/activity_photo/activity.html",
        ) >= 0
      ) {
        rTempPosterImageURL =
          "../../../images/activity_macro_static_images/community.png";
        rTempPosterImageBackURL = "../../../theme_community_level_2.html";
      } else {
        rTempPosterImageURL =
          "../../images/activity_macro_static_images/community.png";
        rTempPosterImageBackURL = "../../theme_community_level_2.html";
      }
      doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
    }
  }
  /*Community End*/

  /*Environment Begin*/
  if (rTempDocHref.indexOf("environment") >= 0) {
    if (rFirstPartURL.indexOf("activities") >= 0) {
      if (
        rFirstPartURL.indexOf(
          "activities/environment_photo/activity_photo/activity.html",
        ) >= 0
      ) {
        rTempPosterImageURL =
          "../../../images/activity_macro_static_images/environment.png";
        rTempPosterImageBackURL = "../../../theme_environment_level_2.html";
      } else {
        rTempPosterImageURL =
          "../../images/activity_macro_static_images/environment.png";
        rTempPosterImageBackURL = "../../theme_environment_level_2.html";
      }
      doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
    }
  }
  /*Environment End*/

  /*Explore Begin*/
  if (rTempDocHref.indexOf("explore") >= 0) {
    if (rTempDocHref.indexOf("nature") >= 0) {
      if (rFirstPartURL.indexOf("activities") >= 0) {
        if (rFirstPartURL.indexOf("activity_photo") >= 0) {
          rTempPosterImageURL =
            "../../../images/activity_macro_static_images/nature.png";
          rTempPosterImageBackURL =
            "../../../theme_explore_level_3_nature.html";
        } else {
          rTempPosterImageURL =
            "../../images/activity_macro_static_images/nature.png";
          rTempPosterImageBackURL = "../../theme_explore_level_3_nature.html";
        }
        doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
      }
    }
    if (rTempDocHref.indexOf("nutrition") >= 0) {
      if (rFirstPartURL.indexOf("activities") >= 0) {
        if (rFirstPartURL.indexOf("activity_photo") >= 0) {
          rTempPosterImageURL =
            "../../../images/activity_macro_static_images/nutrition.png";
          rTempPosterImageBackURL =
            "../../../theme_explore_level_3_nutrition.html";
        } else {
          rTempPosterImageURL =
            "../../images/activity_macro_static_images/nutrition.png";
          rTempPosterImageBackURL =
            "../../theme_explore_level_3_nutrition.html";
        }
        doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
      }
    }
    if (rTempDocHref.indexOf("health_wellbeing") >= 0) {
      if (rFirstPartURL.indexOf("activities") >= 0) {
        if (rFirstPartURL.indexOf("activity_photo") >= 0) {
          rTempPosterImageURL =
            "../../../images/activity_macro_static_images/wellbeing.png";
          rTempPosterImageBackURL =
            "../../../theme_explore_level_3_health_wellbeing.html";
        } else {
          rTempPosterImageURL =
            "../../images/activity_macro_static_images/wellbeing.png";
          rTempPosterImageBackURL =
            "../../theme_explore_level_3_health_wellbeing.html";
        }
        doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
      }
    }
    if (rTempDocHref.indexOf("music") >= 0) {
      if (rFirstPartURL.indexOf("activities") >= 0) {
        if (rFirstPartURL.indexOf("activity_photo") >= 0) {
          rTempPosterImageURL =
            "../../../images/activity_macro_static_images/busy.png";
          rTempPosterImageBackURL = "../../../theme_explore_level_3_busy.html";
        } else {
          rTempPosterImageURL =
            "../../images/activity_macro_static_images/busy.png";
          rTempPosterImageBackURL = "../../theme_explore_level_3_busy.html";
        }
        doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
      }
    }
    if (rTempDocHref.indexOf("family") >= 0) {
      if (rFirstPartURL.indexOf("activities") >= 0) {
        if (rFirstPartURL.indexOf("activity_photo") >= 0) {
          rTempPosterImageURL =
            "../../../images/activity_macro_static_images/family.png";
          rTempPosterImageBackURL =
            "../../../theme_explore_level_3_family.html";
        } else {
          rTempPosterImageURL =
            "../../images/activity_macro_static_images/family.png";
          rTempPosterImageBackURL = "../../theme_explore_level_3_family.html";
        }
        doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
      }
    }
    if (rTempDocHref.indexOf("mother_language") >= 0) {
      if (rFirstPartURL.indexOf("activities") >= 0) {
        if (rFirstPartURL.indexOf("activity_photo") >= 0) {
          rTempPosterImageURL =
            "../../../images/activity_macro_static_images/language.png";
          rTempPosterImageBackURL =
            "../../../theme_explore_level_3_mother_language.html";
        } else {
          rTempPosterImageURL =
            "../../images/activity_macro_static_images/language.png";
          rTempPosterImageBackURL =
            "../../theme_explore_level_3_mother_language.html";
        }
        doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
      }
    }
    if (rTempDocHref.indexOf("inclusion") >= 0) {
      if (rFirstPartURL.indexOf("activities") >= 0) {
        if (rFirstPartURL.indexOf("activity_photo") >= 0) {
          rTempPosterImageURL =
            "../../../images/activity_macro_static_images/inclusion.png";
          rTempPosterImageBackURL =
            "../../../theme_explore_level_3_inclusion.html";
        } else {
          rTempPosterImageURL =
            "../../images/activity_macro_static_images/inclusion.png";
          rTempPosterImageBackURL =
            "../../theme_explore_level_3_inclusion.html";
        }
        doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
      }
    }
    if (rTempDocHref.indexOf("imagination") >= 0) {
      if (rFirstPartURL.indexOf("activities") >= 0) {
        if (rFirstPartURL.indexOf("activity_photo") >= 0) {
          rTempPosterImageURL =
            "../../../images/activity_macro_static_images/imagination.png";
          rTempPosterImageBackURL =
            "../../../theme_explore_level_3_imagination.html";
        } else {
          rTempPosterImageURL =
            "../../images/activity_macro_static_images/imagination.png";
          rTempPosterImageBackURL =
            "../../theme_explore_level_3_imagination.html";
        }
        doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL);
      }
    }
  }
  /*Explore End*/
}

function doPlacePosterImage(rTempPosterImageURL, rTempPosterImageBackURL) {
  if (
    document.getElementById("divPosterImage") != null &&
    document.getElementById("divPosterImage") != undefined &&
    document.getElementById("divPosterImage") != ""
  ) {
    document
      .getElementById("divPosterImage")
      .getElementsByTagName("img")[0].src = rTempPosterImageURL;
    document
      .getElementById("divPosterImage")
      .addEventListener("click", function () {
        document.location.href = rTempPosterImageBackURL;
      });
  }
}

window.addEventListener("load", (event) => {
  doMacroBtnSizeAndAlignment();
  doSetPosterIconAndURL();
});
