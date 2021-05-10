document.addEventListener("DOMContentLoaded", function () {
  //setting up timer
  const FULL_DASH_ARRAY = 283; //1500
  const WARNING_THRESHOLD = 750;
  const ALERT_THRESHOLD = 375;

  const COLOR_CODES = {
    info: {
      color: "green"
    },
    warning: {
      color: "orange",
      threshold: WARNING_THRESHOLD
    },
    alert: {
      color: "red",
      threshold: ALERT_THRESHOLD

    },
  };

  const TIME_LIMIT = 1500;
  let timePassed = 0;
  let timeLeft = TIME_LIMIT;
  let timerInterval = null;
  let remainingPathColor = COLOR_CODES.info.color;

  //timer to HTML
  document.getElementById("timer").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label"> ${formatTime(
    timeLeft
  )} </span>
</div>
`;

  var trackTimer = 0; //0 = off, 1 = on

  //timer for the page
  timerInterval = setInterval(() => {
    chrome.runtime.sendMessage(
      {
        action: "askTime",
      },
      function (response) {
        timeLeft = response[0];
        trackTimer = response[1];

        if (trackTimer == 1) {
          document.getElementById("playButton").style.display = "none";
          document.getElementById("resetButton").style.display = "block";

          document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
          );
          setCircleDasharray();
          setRemainingPathColor(timeLeft);
        } else if (trackTimer == 0) {
          document.getElementById("playButton").style.display = "block";
          document.getElementById("resetButton").style.display = "none";
          document.getElementById("base-timer-label").innerHTML = formatTime(
            1500
          );
          setCircleDasharray();
          setRemainingPathColor(1500);
        }
      }
    );
  }, 1000);

  //formats the timer
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }

  //formats the path around the timer
  function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(warning.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(info.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(warning.color);
    }
  }

  function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
  }

  function setCircleDasharray() {
    const circleDasharray = `${(
      calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
      .getElementById("base-timer-path-remaining")
      .setAttribute("stroke-dasharray", circleDasharray);
  }

  //start and stop button
  document.getElementById("start").addEventListener("click", function (ev) {
    if (trackTimer == 0) {
      trackTimer = 1;
      document.getElementById("playButton").style.display = "none";
      document.getElementById("resetButton").style.display = "block";

      chrome.runtime.sendMessage(
        {
          action: "startTimer",
        },
        function (response) {
        }
      );
    } else if (trackTimer == 1) {
      trackTimer = 0;
      document.getElementById("playButton").style.display = "block";
      document.getElementById("resetButton").style.display = "none";

      chrome.runtime.sendMessage(
        {
          action: "resetTime",
        },
        function (response) {
          document.getElementById("base-timer-label").innerHTML = formatTime(
            TIME_LIMIT
          );
        }
      );
    }
  });

  // get list data on load 
  chrome.runtime.sendMessage(
    {
      action: "getData",
    },
    function (response) {
      document.getElementById("myUL").innerHTML = "";
      // invoke callback with response
      //makes list on screen
      for (i = 0; i < response["item"].length; i++) {
        var li = document.createElement("li");
        var nextItem = response["item"][i]["message"];
        var nextStatus = response["item"][i]["status"];
        var nextSubs = response["item"][i]["sub"];

        if (nextItem != undefined) {
          var span = document.createElement("SPAN");
          var txt = document.createTextNode("\uFF0B");
          span.className = "open";
          span.appendChild(txt);
          li.appendChild(span);

          var span = document.createElement("SPAN");
          var txt = document.createTextNode("\u2713");
          span.className = "cross";
          span.appendChild(txt);
          li.appendChild(span);

          var span = document.createElement("SPAN");
          var txt = document.createTextNode("\u00D7");
          span.className = "close";
          span.appendChild(txt);
          li.appendChild(span);

          var span = document.createElement("P");
          var txt = document.createTextNode(nextItem);
          span.className = "lTxt";
          span.appendChild(txt);
          li.appendChild(span);

          if (nextStatus == "checked") {
            li.classList.toggle("checked");
          }

          document.getElementById("myUL").appendChild(li);

          //subtasks
          if (nextSubs != undefined) {
            for (var j = 0; j < nextSubs.length; j++) {
              var li = document.createElement("li");

              var span = document.createElement("SPAN");
              var txt = document.createTextNode("\u00D7");
              span.className = "close";
              span.appendChild(txt);
              li.appendChild(span);

              var span = document.createElement("P");
              var txt = document.createTextNode(nextSubs[j]);
              span.className = "sub";
              span.appendChild(txt);
              li.appendChild(span);

              li.classList = "sub";

              document.getElementById("myUL").appendChild(li);
            }
          }
        }
      }
    }
  );

  //add button
  var btn = document.getElementById("addButton");

  //Adding to the list
  btn.addEventListener("click", function () {
    var inputValue = document.getElementById("myInput").value;

    if (inputValue === "") {
      alert("You must write something!");
    } else {
      chrome.runtime.sendMessage(
        { message: inputValue, status: "unchecked" },
        function (response) {
          var li = document.createElement("li");
          var nextItem =
            response["item"][response["item"].length - 1]["message"];

          if (nextItem != undefined) {
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\uFF0B");
            span.className = "open";
            span.appendChild(txt);
            li.appendChild(span);

            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u2713");
            span.className = "cross";
            span.appendChild(txt);
            li.appendChild(span);

            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "close";
            span.appendChild(txt);
            li.appendChild(span);

            var span = document.createElement("P");
            var txt = document.createTextNode(nextItem);
            span.className = "lTxt";
            span.appendChild(txt);
            li.appendChild(span);

            document.getElementById("myUL").appendChild(li);
          }
        }
      );
    }
    document.getElementById("myInput").value = "";
  });

  // Add a "checked" symbol when clicking on a list item
  var list = document.querySelector("ul");
  list.addEventListener(
    "click",
    function (ev) {

      if (ev.target.className === "close") {
        //get rid of this element
        if (ev.target.parentElement.className == "sub") {
          var elDelete = ev.target.parentElement.innerText;
          var textelDelete = elDelete.slice(3, elDelete.length);

          var action = "deleteSub";
        } else {
          var elDelete = ev.target.parentElement.innerText;
          var textelDelete = elDelete.slice(7, elDelete.length);
          var action = "delete";
        }

        chrome.runtime.sendMessage(
          {
            action: action,
            message: textelDelete,
          },
          function (response) {
            // invoke callback with response
            // rewrite the screen
            document.getElementById("myUL").innerHTML = "";
            for (i = 0; i < response["item"].length; i++) {
              var li = document.createElement("li");
              var nextItem = response["item"][i]["message"];
              var nextStatus = response["item"][i]["status"];
              var nextSubs = response["item"][i]["sub"];

              if (nextItem != undefined) {
                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\uFF0B");
                span.className = "open";
                span.appendChild(txt);
                li.appendChild(span);

                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\u2713");
                span.className = "cross";
                span.appendChild(txt);
                li.appendChild(span);

                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\u00D7");
                span.className = "close";
                span.appendChild(txt);
                li.appendChild(span);

                var span = document.createElement("P");
                var txt = document.createTextNode(nextItem);
                span.className = "lTxt";
                span.appendChild(txt);
                li.appendChild(span);

                if (nextStatus == "checked") {
                  li.classList.toggle("checked");
                }

                document.getElementById("myUL").appendChild(li);

                if (nextSubs != undefined) {
                  for (var j = 0; j < nextSubs.length; j++) {
                    var li = document.createElement("li");

                    var span = document.createElement("SPAN");
                    var txt = document.createTextNode("\u00D7");
                    span.className = "close";
                    span.appendChild(txt);
                    li.appendChild(span);

                    var span = document.createElement("P");
                    var txt = document.createTextNode(nextSubs[j]);
                    span.className = "sub";
                    span.appendChild(txt);
                    li.appendChild(span);

                    li.classList = "sub";

                    document.getElementById("myUL").appendChild(li);
                  }
                }
              }
            }
          }
        );
      } else if (ev.target.className === "open") {
        //check this element
        var elCheck = ev.target.parentElement.innerText;
        var textelCheck = elCheck.slice(7, elCheck.length);

        //add subcategory
        chrome.runtime.sendMessage(
          {
            action: "sub",
            message: textelCheck,
          },
          function (response) {
            // invoke callback with response
            // rewrite the screen
            document.getElementById("myUL").innerHTML = "";

            for (i = 0; i < response["item"].length; i++) {
              var li = document.createElement("li");

              var nextItem = response["item"][i]["message"];
              var nextStatus = response["item"][i]["status"];
              var nextSubs = response["item"][i]["sub"];

              if (nextItem != undefined) {
                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\uFF0B");
                span.className = "open";
                span.appendChild(txt);
                li.appendChild(span);

                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\u2713");
                span.className = "cross";
                span.appendChild(txt);
                li.appendChild(span);

                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\u00D7");
                span.className = "close";
                span.appendChild(txt);
                li.appendChild(span);

                var span = document.createElement("P");
                var txt = document.createTextNode(nextItem);
                span.className = "lTxt";
                span.appendChild(txt);
                li.appendChild(span);

                if (nextStatus == "checked") {
                  li.classList.toggle("checked");
                }

                document.getElementById("myUL").appendChild(li);

                if (nextSubs != undefined) {
                  for (var j = 0; j < nextSubs.length; j++) {
                    var li = document.createElement("li");

                    var span = document.createElement("SPAN");
                    var txt = document.createTextNode("\u00D7");
                    span.className = "close";
                    span.appendChild(txt);
                    li.appendChild(span);

                    var span = document.createElement("P");
                    var txt = document.createTextNode(nextSubs[j]);
                    span.className = "sub";
                    span.appendChild(txt);
                    li.appendChild(span);

                    li.classList = "sub";

                    document.getElementById("myUL").appendChild(li);
                  }
                }
              }
            }
          }
        );
      } else if (ev.target.className === "cross") {
        //check this element
        var elCheck = ev.target.parentElement.innerText;
        var textelCheck = elCheck.slice(7, elCheck.length);

        //mark as checked off
        chrome.runtime.sendMessage(
          {
            action: "check",
            message: textelCheck,
          },
          function (response) {
            // invoke callback with response
            // change css for this element on the screen
            ev.target.parentElement.classList.toggle("checked");
          }
        );
      } else {
        //edit subtasks
        var oldText = ev.target.innerText;

        if (ev.target.className == "sub") {
          var action = "editSub";
        } else {
          var action = "edit";
        }

        if (
          ev.target.tagName === "P" &&
          ev.target.className != "open" &&
          ev.target.className != "close" &&
          ev.target.className != "cross"
        ) {
          //makes the task editable and focuses on it to type easily
          ev.target.contentEditable = true;
          ev.target.focus();

          ev.target.addEventListener("input", function () {
            document.getElementById("saving").innerHTML = "Autosaving...";
            setTimeout(function(){
              document.getElementById("saving").innerHTML = " ";
            }, 1500)

            var elEdit = ev.target.innerText;

            console.log(oldText + " " + elEdit);

            chrome.runtime.sendMessage(
              {
                action: action,
                fix: oldText,
                message: elEdit,
                status: "unchecked",
              },
              function (response) {
                oldText = response;
              }
            );
          });
        }
      }
    },
    false
  );
});
