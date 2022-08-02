import { messages } from "./basics";
import { notificationCheck } from "./notificationsCheck";

var today = new Date();

notificationCheck();

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    (tab.url!.indexOf("https://twitter/") > -1 ||
      tab.url!.indexOf("https://twitter.com/") ||
      tab.url!.indexOf("https://mobile.twitter.com/")) &&
    changeInfo.url === undefined
  ) {
    notificationCheck();
  }
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
    today = new Date();
  }
}, 500);
