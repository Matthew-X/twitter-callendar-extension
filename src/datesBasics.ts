import { base_user_data } from "./basics";

export { months, dateComparison };

// Array of months for tests.
var months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
// A function that will allow us to sort dates in order.
function dateComparison(
  a: any = { ...base_user_data },
  b: any = { ...base_user_data }
) {
  let date1 = new Date(a.BirthdayDate);
  let date2 = new Date(b.BirthdayDate);

  // All "Trash dates" get sorted down
  if (
    !months.some((month) => {
      var RegExMonth = new RegExp("\\b" + month + "\\b");
      return RegExMonth.test(a.BirthdayDate.toLowerCase());
    }) &&
    !/\d/.test(a.BirthdayDate)
  ) {
    if (
      !months.some((month) => {
        var RegExMonth = new RegExp("\\b" + month + "\\b");
        return RegExMonth.test(b.BirthdayDate.toLowerCase());
      }) &&
      !/\d/.test(b.BirthdayDate)
    ) {
      return a.BirthdayDate.localeCompare(b.BirthdayDate);
    } else {
      return 1;
    }
  } else if (
    !months.some((month) => {
      var RegExMonth = new RegExp("\\b" + month + "\\b");
      return RegExMonth.test(b.BirthdayDate.toLowerCase());
    }) &&
    !/\d/.test(b.BirthdayDate)
  ) {
    if (
      !months.some((month) => {
        var RegExMonth = new RegExp("\\b" + month + "\\b");
        return RegExMonth.test(a.BirthdayDate.toLowerCase());
      }) &&
      !/\d/.test(a.BirthdayDate)
    ) {
      return b.BirthdayDate.localeCompare(a.BirthdayDate);
    } else {
      return -1;
    }
  } else if (
    // All "Year only" dates get sorted down but above trash dates.
    !months.some((month) => {
      var RegExMonth = new RegExp("\\b" + month + "\\b");
      return RegExMonth.test(a.BirthdayDate.toLowerCase());
    })
  ) {
    if (
      months.some((month) => {
        var RegExMonth = new RegExp("\\b" + month + "\\b");
        return RegExMonth.test(b.BirthdayDate.toLowerCase());
      })
    ) {
      return 1;
    } else {
      return date1.getFullYear() - date2.getFullYear();
    }
  } else if (
    !months.some((month) => {
      var RegExMonth = new RegExp("\\b" + month + "\\b");
      return RegExMonth.test(b.BirthdayDate.toLowerCase());
    })
  ) {
    if (
      months.some((month) => {
        var RegExMonth = new RegExp("\\b" + month + "\\b");
        return RegExMonth.test(a.BirthdayDate.toLowerCase());
      })
    ) {
      return -1;
    } else {
      return date2.getFullYear() - date1.getFullYear();
    }
  } else {
    if (!/\d/.test(a.BirthdayDate)) {
      date1 = new Date(
        months.find((month) => {
          var RegExMonth = new RegExp("\\b" + month + "\\b");
          return RegExMonth.test(a.BirthdayDate.toLowerCase());
        }) + "1"
      );
    }
    if (!/\d/.test(b.BirthdayDate)) {
      date2 = new Date(
        months.find((month) => {
          var RegExMonth = new RegExp("\\b" + month + "\\b");
          return RegExMonth.test(b.BirthdayDate.toLowerCase());
        }) + "1"
      );
    }
    // All normal months with dates get sorted includeing sorted by year with the same date
    if (date1.getMonth() != date2.getMonth()) {
      if (new Date().getMonth() > date1.getMonth()) {
        if (
          new Date().getMonth() > date1.getMonth() &&
          new Date().getMonth() > date2.getMonth()
        ) {
          return date1.getMonth() - date2.getMonth();
        }
        return 1;
      } else if (new Date().getMonth() > date2.getMonth()) {
        if (
          new Date().getMonth() > date1.getMonth() &&
          new Date().getMonth() > date2.getMonth()
        ) {
          return date1.getMonth() - date2.getMonth();
        }
        return -1;
      } else if (
        new Date().getMonth() == date1.getMonth() &&
        new Date().getDate() > date1.getDate()
      ) {
        return 1;
      } else if (
        new Date().getMonth() == date2.getMonth() &&
        new Date().getDate() > date2.getDate()
      ) {
        return -1;
      } else {
        return date1.getMonth() - date2.getMonth();
      }
    }
    if (date1.getMonth() == date2.getMonth()) {
      if (date1.getDate() == date2.getDate()) {
        return date1.getFullYear() - date2.getFullYear();
      }
      if (
        new Date().getMonth() == date1.getMonth() &&
        new Date().getDate() > date1.getDate()
      ) {
        if (
          new Date().getMonth() == date2.getMonth() &&
          new Date().getDate() > date2.getDate()
        ) {
          return date1.getDate() - date2.getDate();
        }
        return 1;
      } else if (
        new Date().getMonth() == date2.getMonth() &&
        new Date().getDate() > date2.getDate()
      ) {
        if (
          new Date().getMonth() == date1.getMonth() &&
          new Date().getDate() > date1.getDate()
        ) {
          return date1.getDate() - date2.getDate();
        }
        return -1;
      }
      return date1.getDate() - date2.getDate();
    }
  }
}
