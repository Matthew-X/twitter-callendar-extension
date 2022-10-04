import { base_user_data, chromeGetValue, save_file } from "./basics";
import { months, normalDates, yearOnlyDate } from "./datesBasics";
export { notificationCheck };
function notificationCheck() {
  chromeGetValue(save_file).then((result = [{ ...base_user_data }]) => {
    if (result != null && result.length > 0 && result[0].ID != 0) {
      result.forEach(function (v = { ...base_user_data }) {
        if (
          months.some((month) => {
            var RegExMonth = new RegExp("\\b" + month + "\\b");
            return RegExMonth.test(v.BirthdayDate.toLowerCase());
          }) &&
          !/\d/.test(v.BirthdayDate)
        ) {
          v.BirthdayDate =
            months.find((month) => {
              var RegExMonth = new RegExp("\\b" + month + "\\b");
              if (RegExMonth.test(v.BirthdayDate.toLowerCase())) return month;
            }) + " 1";
        }

        var year =
          new Date(v.BirthdayDate).getMonth() < new Date().getMonth()
            ? 1
            : 0 || new Date(v.BirthdayDate).getMonth() == new Date().getMonth()
            ? new Date(v.BirthdayDate).getDate() < new Date().getDate()
              ? 1
              : 0
            : 0;

        if (
          v.settings.notification &&
          new Date(v.notification.last_date).getMonth() <=
            new Date().getMonth() &&
          new Date(v.notification.last_date).getDate() < new Date().getDate() &&
          new normalDates().dateCheck(v, v) &&
          new Date(
            new Date().setFullYear(
              new Date(v.BirthdayDate).getFullYear() - year
            )
          ) >=
            new Date(
              new Date(v.BirthdayDate).setDate(
                new Date(v.BirthdayDate).getDate() - v.settings.initial_start
              )
            ) &&
          ((v.settings.once &&
            new Date(v.notification.last_date.toString()).getFullYear() <
              new Date().getFullYear()) ||
            v.settings.daily)
        ) {
          var days_left = Math.ceil(
            (new Date(v.BirthdayDate).getTime() -
              new Date(
                new Date().setFullYear(
                  new Date(v.BirthdayDate).getFullYear() - year
                )
              ).getTime()) /
              (1000 * 3600 * 24)
          );

          if (days_left > 0) {
            chrome.notifications.create("", {
              type: "basic",
              iconUrl: v.Icon,
              title: `${v.Name}'s Birthday will be in ${days_left} days`,
              message: `If you had anything planned for that, you better get started`,
            });
          } else {
            chrome.notifications.create("", {
              type: "basic",
              iconUrl: v.Icon,
              title: `Today is ${v.Name}'s Birthday`,
              message: `Horay! Wish that person a Happy Birthday or whatever you wanted to do this day`,
            });
          }
          v.notification.last_date = new Date().getTime();
        }
      });
      chrome.storage.sync.set({ save_file: result });
    }
  });
}
