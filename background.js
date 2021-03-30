chrome.runtime.onInstalled.addListener((details) => {
  console.log("Hello from the background script!");
  reset();
});

function reset() {
  let obj = {
    item: [],
  };
  localStorage.setItem("iList", JSON.stringify(obj));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //   console.log(request.action);
  const obj = JSON.parse(localStorage.getItem("iList")); //getItem(the object name key)

  if(request.action === "delete"){
    // console.log(request.message);

    // now delete this message from the list
    for(var i = 0; i < obj.item.length; i++){
        if(request.message == obj.item[i].message){
            console.log(obj.item[i].message);
            obj.item.splice(i,1);
            localStorage.setItem("iList", JSON.stringify(obj));
        }
    }
    // console.log(obj.item);
  }

  if(request.action === "check"){
    for(var i = 0; i < obj.item.length; i++){
      if(request.message == obj.item[i].message){
          console.log(obj.item[i].message);
          if(obj.item[i].status == "unchecked"){
            obj.item[i].status = "checked";
          } else if (obj.item[i].status == "checked") {
            obj.item[i].status = "unchecked";
          }
          console.log(obj.item[i].status);
          localStorage.setItem("iList", JSON.stringify(obj));
      }
  }
  }

  if (request.action != "getData" && request.action != "delete" && request.action != "check") {
    console.log(request);
    obj.item.push(request);
    localStorage.setItem("iList", JSON.stringify(obj));
  }

  sendResponse(obj);
});
