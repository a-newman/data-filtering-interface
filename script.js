BASE_PATH = "http://data.csail.mit.edu/soundnet/actions3/";
SUBMIT_URL = "data";
DEBUG = false;

BUTTON_CLASS = 'button-option';

VIOLATIONS = [
  "Inappropriate (Sexual)",
  "Inappropriate (Violence)",
  "Inappropriate (Nudity)",
  "Inappropriate (Profanity)",
  "Uncomfortable",
  "Captions/text/watermarks",
  "Non-natural videos (e.g. cartoons)",
  "Vertical orientation",
  "Degraded format",
  "Post-processing", 
  "Other"
]

$(document).ready(function() {
    DEBUG = gup("debug") == "true";

    var data_path = gup("data");
    if (data_path.length == 0) data_path = "sample";
    console.log("Using data file with name", data_path);
    $.ajax({
        url: "assets/data/" + data_path + ".json",
        dataType: 'json',
        type: 'GET',
        success: function(data) {
            // assume we just have a list of videos 
            showData(data);

            addButton('Invalid', 'red');
            //addButton('Uncomfortable', 'orange');
            //addButton('Wrong format', 'yellow');

            // addCheckBoxes([
            //   'Label 1',
            //   'Label 2',
            //   'Label 3', 
            // ]);
            addCheckBoxes(VIOLATIONS);

            // setup callback on save button
            $('#submit-button').click(onClickSubmit.bind(this, data_path));
        }
    });
})

function addButton(label, color) {
  var safeLabel = getSafeVersion(label);
  var thisButtonClass = 'button-' + safeLabel;
  $('.video-container').each(function(i, elt) {
    var button = $('<button class="ui toggle button ' + BUTTON_CLASS + ' ' + thisButtonClass + '" data-label="' + safeLabel + '" data-color="' + color + '">' + label + '</button>');
    $(elt).find(".feedback").prepend(button);
  });

  $('button.button-' + safeLabel).click(clickNotExclusive);
}

function addCheckBoxes(labels) {
  $('.video-container').each(function(i, elt) {
    labels.forEach(function(label) {
      var checkSafeLabel = getSafeVersion(label);
      var checkbox = '<div class="field"><div class="ui checkbox"><input type="checkbox" name="' + checkSafeLabel + '"><label>' + label + '</label></div></div>'
      $(elt).find(".grouped.fields").append(checkbox);
    });
  });
}

function clickNotExclusive() {
  // toggle the current button
  toggle(this);

  var container = $(this).closest('.feedback');
  var showForm = false;
  container.find('button').each(function(i, elt) {
    if (isActive(elt)) {
      // show its check boxes 
      showForm = true;
      return false;
    }
  });
  if (showForm) {
    container.find('.form').show();
    //container.find('textarea').focus();
  } else {
    container.find('.form').hide();
  }
}

function clickExclusive() {
  // figure out if the button was already clicked or not 
  var wasActive = isActive(this);

  // turn off all the buttons in the same div
  var container = $(this).closest('.feedback');
  container.find('button').each(function(i, elt) {
    deactivate(elt);
  });
  
  // turn on if applicable
  if (!wasActive) {
    activate(this);
    container.find('.form').show();
    //container.find('textarea').focus();
  } else {
    container.find('.form').hide();
  }
}

function isActive(button) {
  return $(button).hasClass($(button).data('color'));
}

function activate(button) {
  $(button).addClass($(button).data('color'));
}

function deactivate(button) {
  $(button).removeClass($(button).data('color'));
}

function toggle(button) {
  isActive(button) ? deactivate(button) : activate(button);
}

function getSafeVersion(label) {
  return label.replace(" ", "_").toLowerCase();
}

function showData(data) {
  Object.entries(data).forEach(function(elt, i) {
    if (DEBUG && i>=3) return;
    // create a div for the video 
    var key = elt[0];
    var val = elt[1];
    var tag = "video_" + i;
    var html = $(getHTML());
    html.find('source').attr('src', BASE_PATH + key);
    html.data("path", key);
    $('#graph-grid').prepend(html);
    //$('#' + tag).get(0).play();
  });
}

function getHTML() {
  var div = '<div style="float:left; margin:10px" class="ui segment video-container"><video controls autoplay loop muted width="320" height="240"><source src="" type="video/mp4">Your browser does not support the video tag.</video><div class="feedback" style="text-align:center  "></div></div>';
  div = $(div); 

  var feedback = $('<div class="ui form" style="padding-top:10px; display:none"><div class="grouped fields" id="checkbox-options" style="text-align:left"></div><div class="field"><label>Comments or further explanation?</label><textarea></textarea></div></div>');
  div.find(".feedback").append(feedback);

  return div;
}

function onClickSubmit(data_path) {
  $('#submit-button').addClass("loading");

  var data = collectData();
  var results = {
    "data": data,
    "input_file": data_path
  }
  console.log("results", results);
  if (!DEBUG) {
    $.ajax({
        url: SUBMIT_URL,
        type: 'POST',
        data: JSON.stringify(results) ,
        dataType: 'json'
    }).then(function(response) {
        $('#task').hide();
        $('#success').show();
    }).catch(function(error) {
        $('#task').hide();
        $('#data-submitted').text(JSON.stringify(results));
        $('#failure').show();
    });
  }
}

function collectData() {
  var data = {};
  // gather all the data 
  $('.video-container').each(function(i, elt) {
    // check if the thing is marked as inappropriate 
    var path = $(elt).data('path');
    var datum = {} 
    var labels = []; 
    var checks = [];

    $(elt).find('button').each(function(i, button) {
      if (isActive(button)) {
        labels.push($(button).data('label'));
      }
    });

    if (labels.length > 0) {
      datum.labels = labels; 

      $(elt).find(".checkbox").each(function(i, cb) {
        cb = $(cb);
        var inp = cb.find('input');
        if (inp.is(":checked")) {
          checks.push(inp.attr('name'));
        }
      });
      datum.checks = checks; 
      datum.feedback = $(elt).find('textarea').val();
    }

    data[path] = datum;
  });
  return data;
}

function gup(name) {
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var tmpURL = window.location.href;
    var results = regex.exec( tmpURL );
    if (results == null) return "";
    else return results[1];
}
  
