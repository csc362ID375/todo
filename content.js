document.addEventListener("DOMContentLoaded", function () {

  //// Call this when the pop-up is shown
// chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
//   if (response.time) {
//     const time = new Date(response.time);
//     startTimer(time)
//   }
// });

// function startTimer(time) {
//   if (time.getTime() > Date.now()) {
//     setInterval(() => {
//       // display the remaining time
//     }, 1000)

//   }
// }

// function startTime(time) {
//   chrome.runtime.sendMessage({ cmd: 'START_TIMER', when: time });
//   startTimer(time);
// }


  const FULL_DASH_ARRAY = 283;
  const WARNING_THRESHOLD = 10;
  const ALERT_THRESHOLD = 5;

  const COLOR_CODES = {
    info: {
      color: "green",
    },
    warning: {
      color: "orange",
      threshold: WARNING_THRESHOLD,
    },
    alert: {
      color: "red",
      threshold: ALERT_THRESHOLD,
    },
  };

  const TIME_LIMIT = 120;
  let timePassed = 0;
  let timeLeft = TIME_LIMIT;
  let timerInterval = null;
  let remainingPathColor = COLOR_CODES.info.color;

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

  function onTimesUp() {
    clearInterval(timerInterval);
  }

  function startTimer() {
    
    timerInterval = setInterval(() => {

      timePassed = timePassed += 1;
      timeLeft = TIME_LIMIT - timePassed;

      chrome.runtime.sendMessage(
        {
          action: "timer",
          message: timeLeft
        },
        function (response) {

        });

      document.getElementById("base-timer-label").innerHTML = formatTime(
        timeLeft
      );
      setCircleDasharray();
      setRemainingPathColor(timeLeft);

      if (timeLeft === 0) {
        onTimesUp();
      }
    }, 1000);
  }

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }

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
 
  var trackTimer = 0; //0 = off, 1 = on
  document.getElementById("start").addEventListener("click", function (ev) {
    if (trackTimer == 0) {

      trackTimer = 1;
    } else if (trackTimer == 1){

      trackTimer = 0;
    }

    chrome.runtime.sendMessage(
      {
        action: "timer",
      },
      function (response) {
        
      });

    startTimer();
  });

  // get data on load --> is this only when its reset?
  chrome.runtime.sendMessage(
    {
      action: "getData",
    },
    function (response) {
      console.log(response);
      document.getElementById("myUL").innerHTML = "";
      // invoke callback with response
      for (i = 0; i < response["item"].length; i++) {
        var li = document.createElement("li");
        var nextItem = response["item"][i]["message"];
        var nextStatus = response["item"][i]["status"];
        var nextSubs = response["item"][i]["sub"];

        if (nextItem != undefined) {
          var t = document.createTextNode(nextItem);
          li.appendChild(t);

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

          var span = document.createElement("SPAN");
          var txt = document.createTextNode("\uFF0B");
          span.className = "open";
          span.appendChild(txt);
          li.appendChild(span);

          if (nextStatus == "checked") {
            li.classList.toggle("checked");
          }

          document.getElementById("myUL").appendChild(li);

          if (nextSubs != undefined) {
            for (var j = 0; j < nextSubs.length; j++) {
              var li = document.createElement("li");
              var t = document.createTextNode(nextSubs[j]);
              li.appendChild(t);

              var span = document.createElement("SPAN");
              var txt = document.createTextNode("\u00D7");
              span.className = "close";
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
            var t = document.createTextNode(nextItem);
            li.appendChild(t);

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

            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\uFF0B");
            span.className = "open";
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
      // var close = document.getElementsByClassName("close");

      if (ev.target.className === "close") {
        //get rid of this element
        if (ev.target.parentElement.className == "sub") {
          var elDelete = ev.target.parentElement.innerText;
          var textelDelete = elDelete.slice(0, elDelete.length - 2);

          var action = "deleteSub";
        } else {
          var elDelete = ev.target.parentElement.innerText;
          var textelDelete = elDelete.slice(0, elDelete.length - 6);

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
                var t = document.createTextNode(nextItem);
                li.appendChild(t);

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

                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\uFF0B");
                span.className = "open";
                span.appendChild(txt);
                li.appendChild(span);
                document.getElementById("myUL").appendChild(li);

                if (nextSubs != undefined) {
                  for (var j = 0; j < nextSubs.length; j++) {
                    var li = document.createElement("li");
                    var t = document.createTextNode(nextSubs[j]);
                    li.appendChild(t);

                    var span = document.createElement("SPAN");
                    var txt = document.createTextNode("\u00D7");
                    span.className = "close";
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
        var textelCheck = elCheck.slice(0, elCheck.length - 6);

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
                var t = document.createTextNode(nextItem);
                li.appendChild(t);

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

                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\uFF0B");
                span.className = "open";
                span.appendChild(txt);
                li.appendChild(span);

                if (nextStatus == "checked") {
                  li.classList.toggle("checked");
                }

                document.getElementById("myUL").appendChild(li);

                if (nextSubs != undefined) {
                  for (var j = 0; j < nextSubs.length; j++) {
                    var li = document.createElement("li");
                    var t = document.createTextNode(nextSubs[j]);
                    li.appendChild(t);

                    var span = document.createElement("SPAN");
                    var txt = document.createTextNode("\u00D7");
                    span.className = "close";
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
        var textelCheck = elCheck.slice(0, elCheck.length - 6);

        //mark as checked off
        chrome.runtime.sendMessage(
          {
            action: "check",
            message: textelCheck,
          },
          function (response) {
            // invoke callback with response
            // rewrite the screen
            ev.target.parentElement.classList.toggle("checked");
          }
        );
      } else if (ev.target.tagName === "LI") {
        //edit subtasks
        if (ev.target.className == "sub") {
          var elEdit = ev.target.innerText;
          var oldText = elEdit.slice(0, elEdit.length - 2);

          var action = "editSub";
        } else {
          var elEdit = ev.target.innerText;
          var oldText = elEdit.slice(0, elEdit.length - 6);

          var action = "edit";
        }

        ev.target.contentEditable = true;

        //on click event listener for whole page
        var ignoreClickOnMeElement = ev.target;

        window.addEventListener("click", function (event) {
          var isClickInsideElement = ignoreClickOnMeElement.contains(
            event.target
          );
          if (!isClickInsideElement) {
            //Do something click is outside specified element
            //edit subtasks
            if (action == "editSub") {
              var elEdit = ev.target.innerText;
              var textelCheck = elEdit.slice(0, elEdit.length - 2);
            } else {
              var elEdit = ev.target.innerText;
              var textelCheck = elEdit.slice(0, elEdit.length - 6);
            }

            chrome.runtime.sendMessage(
              {
                action: action,
                fix: oldText,
                message: textelCheck,
                status: "unchecked",
              },
              function (response) {}
            );
          }
        });

        //how to send something when i am clicking off?
        // chrome.runtime.connect({ name: "popup" });

        // var port = chrome.runtime.connect({ name: "popup" });
        // port.onDisconnect.addListener(function () {
        //   console.log("disconnected");
        // });

        // chrome.windows.onRemoved.addEventListener( function (event) {
        //     var elCheck = ev.target.innerText;
        //     var textelCheck = elCheck.slice(0, elCheck.length - 6);

        //     console.log(oldText + " " + textelCheck);
        //     chrome.runtime.sendMessage(
        //       {
        //         action: "edit",
        //         fix: oldText,
        //         message: textelCheck,
        //         status: "unchecked",
        //         category: "main",
        //       },
        //       function (response) {}
        //     );
        // });

        // this.addEventListener("clickOutsideThisElement", function () {
        //   var elCheck = ev.target.parentElement.innerText;
        //   var textelCheck = elCheck.slice(0, elCheck.length - 6);

        //   console.log(textelCheck);

        //   chrome.runtime.sendMessage(
        //     {
        //       action: "edit",
        //       fix: oldText,
        //       message: textelCheck,
        //       status: "unchecked",
        //       category: "main",
        //     },
        //     function (response) {}
        //   );
        // });
      }
    },
    false
  );
});
