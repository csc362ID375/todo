chrome.runtime.onInstalled.addListener((details) => {
  console.log("Hello from the background script!");
  reset();
});

function reset() {
  let obj = {
    item: [],
  };
  localStorage.setItem("iList", JSON.stringify(obj));

  let trackTimer = 0;
  localStorage.setItem("trackTimer", JSON.stringify(trackTimer));

  const TIME_LIMIT = 900;
  localStorage.setItem("timer", JSON.stringify(TIME_LIMIT));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);

  const obj = JSON.parse(localStorage.getItem("iList")); //getItem(the object name key)
  const TIME_LIMIT = 900;
  let timePassed = 0;
  let timeLeft = TIME_LIMIT;

  if (request.action === "startTimer") {
    localStorage.setItem("trackTimer", JSON.stringify(1));

    let timerInterval = setInterval(() => {
      if (JSON.parse(localStorage.getItem("timer")) === 0) {
        clearInterval(timerInterval);
        localStorage.setItem("trackTimer", JSON.stringify(0));
        localStorage.setItem("timer", JSON.stringify(TIME_LIMIT));
      } else {
        timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
  
        localStorage.setItem("timer", JSON.stringify(timeLeft));
      }
      
    }, 1000);
  }

  if (request.action === "resetTime") {
    localStorage.setItem("trackTimer", JSON.stringify(0));
    localStorage.setItem("timer", JSON.stringify(0));
  }

  if (request.action === "askTime") {
    sendResponse([JSON.parse(localStorage.getItem("timer")), JSON.parse(localStorage.getItem("trackTimer"))]);
  }

  if (request.action === "delete") {
    // now delete this message from the list
    for (var i = 0; i < obj.item.length; i++) {
      if (request.message == obj.item[i].message) {
        obj.item.splice(i, 1);
        localStorage.setItem("iList", JSON.stringify(obj));
      }
    }
  }

  if (request.action === "deleteSub") {
    // now delete this message from the list
    for (var i = 0; i < obj.item.length; i++) {
      if (obj.item[i].sub != undefined) {
        for (var j = 0; j < obj.item[i].sub.length; j++) {
          if (request.message == obj.item[i].sub[i]) {
            obj.item[i].sub.splice(i, 1);
            localStorage.setItem("iList", JSON.stringify(obj));
          }
        }
      }
    }
  }

  if (request.action === "sub") {
    for (var i = 0; i < obj.item.length; i++) {
      if (request.message == obj.item[i].message) {
        if (obj.item[i].sub) {
          obj.item[i].sub.push("Edit Me");
        } else {
          obj.item[i].sub = ["Edit Me"];
        }
        localStorage.setItem("iList", JSON.stringify(obj));
      }
    }
  }

  if (request.action === "check") {
    for (var i = 0; i < obj.item.length; i++) {
      if (request.message == obj.item[i].message) {
        if (obj.item[i].status == "unchecked") {
          obj.item[i].status = "checked";
        } else if (obj.item[i].status == "checked") {
          obj.item[i].status = "unchecked";
        }
        localStorage.setItem("iList", JSON.stringify(obj));
      }
    }
  }

  if (request.action === "edit") {
    for (var i = 0; i < obj.item.length; i++) {
      if (request.fix == obj.item[i].message) {
        obj.item[i].message = request.message;
        localStorage.setItem("iList", JSON.stringify(obj));
      }
    }
  }

  if (request.action === "editSub") {
    // now edit this message from the sub list
    for (var i = 0; i < obj.item.length; i++) {
      if (obj.item[i].sub != undefined) {
        for (var j = 0; j < obj.item[i].sub.length; j++) {
          if (request.fix == obj.item[i].sub[i]) {
            obj.item[i].sub[i] = request.message;
            localStorage.setItem("iList", JSON.stringify(obj));
          }
        }
      }
    }
  }

  if (
    request.action != "getData" &&
    request.action != "delete" &&
    request.action != "check" &&
    request.action != "edit" &&
    request.action != "editSub" &&
    request.action != "sub" &&
    request.action != "deleteSub" &&
    request.action != "startTimer" &&
    request.action != "askTime" && 
    request.action != "resetTime"
  ) {
    //adding a new object
    obj.item.push(request);
    localStorage.setItem("iList", JSON.stringify(obj));
  }


  //sending response back
  sendResponse(obj);
});

// background.js
chrome.runtime.onConnectExternal.addListener(function (port) {
  if (port.name === "popup") {
    port.onDisconnect.addListener(function () {
      console.log("pop up closed");
    });
  }
});
