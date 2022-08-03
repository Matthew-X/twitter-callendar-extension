import { base_user_data, user_data } from "./basics";

export { months, dateComparison, yearOnlyDate, normalDates, trashDate };

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

function hasMonth(a: user_data) {
  return months.some((month) => {
    var RegExMonth = new RegExp("\\b" + month + "\\b");
    return RegExMonth.test(a.BirthdayDate.toLowerCase());
  });
}

class trashDate {
  a: any;
  b: any;
  constructor(
    a: user_data = { ...base_user_data },
    b: user_data = { ...base_user_data }
  ) {
    this.a = a;
    this.b = b;
  }

  dateCheck(a: user_data) {
    if (
      !months.some((month) => {
        var RegExMonth = new RegExp("\\b" + month + "\\b");
        return RegExMonth.test(a.BirthdayDate.toLowerCase());
      }) &&
      !/\d/.test(a.BirthdayDate)
    ) {
      return true;
    } else {
      return false;
    }
  }

  find() {
    if (this.dateCheck(this.a)) {
      if (this.dateCheck(this.b)) {
        return this.a.BirthdayDate.localeCompare(this.b.BirthdayDate);
      } else {
        return 1;
      }
    } else if (this.dateCheck(this.b)) {
      if (this.dateCheck(this.a)) {
        return this.b.BirthdayDate.localeCompare(this.a.BirthdayDate);
      } else {
        return -1;
      }
    }
  }
}

class yearOnlyDate {
  a: any;
  b: any;
  constructor(
    a: user_data = { ...base_user_data },
    b: user_data = { ...base_user_data }
  ) {
    this.a = a;
    this.b = b;
  }

  dateCheck(a: user_data) {
    if (
      !months.some((month) => {
        var RegExMonth = new RegExp("\\b" + month + "\\b");
        return RegExMonth.test(a.BirthdayDate.toLowerCase());
      }) &&
      !a.BirthdayDate.includes("/")
    ) {
      return true;
    } else {
      return false;
    }
  }

  find() {
    const date1 = new Date(this.a.BirthdayDate);
    const date2 = new Date(this.b.BirthdayDate);
    if (
      // All "Year only" dates get sorted down but above trash dates.
      this.dateCheck(this.a)
    ) {
      if (!this.dateCheck(this.b)) {
        return 1;
      } else {
        return date1.getFullYear() - date2.getFullYear();
      }
    } else if (this.dateCheck(this.b)) {
      if (!this.dateCheck(this.a)) {
        return -1;
      } else {
        return date2.getFullYear() - date1.getFullYear();
      }
    }
  }
}

class normalDates {
  a: any;
  b: any;
  constructor(
    a: user_data = { ...base_user_data },
    b: user_data = { ...base_user_data }
  ) {
    this.a = a;
    this.b = b;
  }

  dateCheck(a: user_data, b: user_data) {
    if (
      new trashDate(a, b).dateCheck(this.a) ||
      new trashDate(a, b).dateCheck(this.b) ||
      new yearOnlyDate(a, b).dateCheck(this.a) ||
      new yearOnlyDate(a, b).dateCheck(this.b)
    ) {
      return true;
    } else {
      return false;
    }
  }

  find() {
    let date1 = new Date(this.a.BirthdayDate);
    let date2 = new Date(this.b.BirthdayDate);

    if (this.dateCheck(this.a, this.b)) {
      console.log(date1);
      console.log(date2);
      return;
    }

    if (!/\d/.test(this.a.BirthdayDate)) {
      date1 = new Date(
        months.find((month) => {
          var RegExMonth = new RegExp("\\b" + month + "\\b");
          return RegExMonth.test(this.a.BirthdayDate.toLowerCase());
        }) + "1"
      );
    }
    if (!/\d/.test(this.b.BirthdayDate)) {
      date2 = new Date(
        months.find((month) => {
          var RegExMonth = new RegExp("\\b" + month + "\\b");
          return RegExMonth.test(this.b.BirthdayDate.toLowerCase());
        }) + "1"
      );
    }

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
        if (hasMonth(this.a) && !/\d/.test(this.a.BirthdayDate)) {
          return -1;
        } else if (hasMonth(this.b) && !/\d/.test(this.b.BirthdayDate)) {
          return 1;
        }
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

function dateComparison(
  a: user_data = { ...base_user_data },
  b: user_data = { ...base_user_data }
) {
  // All "Trash dates" get sorted down
  if (new trashDate(a, b).dateCheck(a) || new trashDate(a, b).dateCheck(b)) {
    return new trashDate(a, b).find();
  }

  // All "Year only dates" get sorted down
  if (
    new yearOnlyDate(a, b).dateCheck(a) ||
    new yearOnlyDate(a, b).dateCheck(b)
  ) {
    return new yearOnlyDate(a, b).find();
  }

  // All normal months with dates get sorted includeing sorted by year with the same date
  return new normalDates(a, b).find();
}
