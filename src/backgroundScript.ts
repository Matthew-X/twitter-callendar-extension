import { messages } from "./basics";
import { notificationCheck } from "./notificationsCheck";

var today = new Date();

notificationCheck();

chrome.tabs.onUpdated.addListener(function () {
  notificationCheck();
});

chrome.runtime.onMessage.addListener((message) => {
  switch (message) {
    case messages.notificationsUpdate:
      notificationCheck();
  }
});

setInterval(function () {
  if (
    today.getMonth() <= new Date().getMonth() &&
    today.getDate() != new Date().getDate()
  ) {
    notificationCheck();
  }
  console.log("working?");
}, 500);
