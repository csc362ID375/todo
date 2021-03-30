document.addEventListener("DOMContentLoaded", function () {
  // get data on load
  chrome.runtime.sendMessage(
    {
      action: "getData",
    },
    function (response) {
      // invoke callback with response
      // console.log(response["item"].length);
      for (i = 0; i < response["item"].length; i++) {
        var li = document.createElement("li");
        var nextItem = response["item"][i]["message"];
        var nextStatus = response["item"][i]["status"];

        // console.log(nextItem);
        if (nextItem != undefined) {
          var t = document.createTextNode(nextItem);
          li.appendChild(t);
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
        { message: inputValue, status: "unchecked", category: "main" },
        function (response) {
          var li = document.createElement("li");
          // console.log(response["item"].length);
          var nextItem =
            response["item"][response["item"].length - 1]["message"];
          // console.log(nextItem);
          if (nextItem != undefined) {
            var t = document.createTextNode(nextItem);
            li.appendChild(t);
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
        var elDelete = ev.target.parentElement.innerText;
        var textelDelete = elDelete.slice(0, elDelete.length - 4);
        console.log(textelDelete);

        chrome.runtime.sendMessage(
          {
            action: "delete",
            message: textelDelete,
          },
          function (response) {
            // invoke callback with response
            // rewrite the screen
            document.getElementById("myUL").innerHTML = "";
            for (i = 0; i < response["item"].length; i++) {
              var li = document.createElement("li");
              var nextItem = response["item"][i]["message"];
              // console.log(nextItem);
              if (nextItem != undefined) {
                var t = document.createTextNode(nextItem);
                li.appendChild(t);
                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\u00D7");
                span.className = "close";
                span.appendChild(txt);
                li.appendChild(span);
                document.getElementById("myUL").appendChild(li);
              }
            }
          }
        );
      } else if (ev.target.tagName === "open") {
        //add a subcategory --> how do I want that to be on the screen?
      } else if (ev.target.tagName === "LI") {
        //check this element
        var elCheck = ev.target.parentElement.innerText;
        var textelCheck = elCheck.slice(0, elCheck.length - 2);
        //mark as checked off
        chrome.runtime.sendMessage(
          {
            action: "check",
            message: textelCheck,
          },
          function (response) {
            // invoke callback with response
            // rewrite the screen
            ev.target.classList.toggle("checked");
          }
        );
      }
    },
    false
  );
});
