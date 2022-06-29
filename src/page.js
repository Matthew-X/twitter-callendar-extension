// Variable that saves key for chrome.storage to manage data in it.
const save_file = "save_file";
const settings_key = "settings";

let settings_base = {
  notification: true,
  initial_start: 10,
  once: false,
  daily: true,
};

// Blank for item in data-base.
let base_user_data = {
  ID: "0",
  Icon: "",
  Name: "",
  UserID: "",
  BirthdayDate: "",
  settings: settings_base,
};

// chrome.storage.sync.clear(save_edit);

// A piece of code that creates initial database for user when user launches code for the first time.

// A function that retrieves data from chrome.storage.
function chromeGetValue(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items[key]);
    });
  });
}

chromeGetValue(settings_key).then((results) => {
  if (results == null) {
    console.log("Settings are null");
  }
});

// A function that that retrieves a Main-Parent of twitter's left side bar with all the buttons to navigate between pages like (home, messages, bookmarks).
function getParent() {
  var arrPrimary = Array.from(
    document.querySelectorAll('[aria-label="Primary"]')
  );
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find((el) => el.getAttribute("role") == "navigation");
}

// A function that retrieves Main-Parent of the page (everyhting that is on the right from twitter's left side bar).
function getMainParent() {
  var arrPrimary = Array.from(document.querySelectorAll('[role="main"]'));
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find((el) => el.getElementsByTagName("div")[0]);
}

// A function that retrieves a (birthday element that already exists on the page (if exists)) and then returns it's content.
function getBDBParent() {
  var arrPrimary = Array.from(
    document.querySelectorAll('[data-testid="UserBirthdate"]')
  );
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find((el) => {
    if (el.classList.contains("custom_button")) {
      if (arrPrimary.length == 1) {
        document.querySelector('[class="Birthday_button"]').remove();
      }
    } else {
      return el.getElementsByTagName("span");
    }
  });
}

// A part of code that initiates the piece of code that creates Calendar button.
requestAnimationFrame(initCalendarButton);

// A function that will keep searching for a twitter's left side bar in order to parse it into the function to inject Calendar button into that bar.
function initCalendarButton() {
  var parentElement = getParent();

  if (parentElement != null) {
    setupCalendar(parentElement);
  } else {
    requestAnimationFrame(initCalendarButton);
  }
}

// A part of code that initiates piece of code that creates a Birthday save button.
requestAnimationFrame(initBDB);

// Variable that saves initial page's url/href upon loading on the page.
var oldHref = document.location.href;

// Piece of code that upon loading starts an observer that tracks every change on the page and upon url change it re-initiates function that make's Birthday button to appear.
window.onload = function () {
  var bodyList = document.querySelector("body");

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        if (document.querySelector('[class="page_div"]') != null) {
          document.querySelector('[class="page_div"]').remove();
          if (
            getMainParent()
              .getElementsByTagName("div")[0]
              .getElementsByTagName("div")[0].style.display == "none"
          ) {
            getMainParent()
              .getElementsByTagName("div")[0]
              .getElementsByTagName("div")[0].style.display = "flex";
          }
        }
        if (active) {
          active = !active;
          document
            .querySelector('[class="Calendar_button"]')
            .querySelector("img").src = chrome.runtime.getURL(
            "assets/images/calendar_icon.svg"
          );
        }
        initBDB();
      }
    });
  });

  var config = {
    childList: true,
    subtree: true,
  };

  observer.observe(bodyList, config);
};

// Array of months for tests.
var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
// A function that will allow us to sort dates in order.
function dateComparison(a, b) {
  let date1 = new Date(a.BirthdayDate);
  let date2 = new Date(b.BirthdayDate);

  // All "Trash dates" get sorted down
  if (
    !months.some((month) => {
      return a.BirthdayDate.includes(month);
    }) &&
    !/\d/.test(a.BirthdayDate)
  ) {
    if (
      !months.some((month) => {
        return b.BirthdayDate.includes(month);
      }) &&
      !/\d/.test(b.BirthdayDate)
    ) {
      return a.BirthdayDate - b.BirthdayDate;
    } else {
      return 1;
    }
  } else if (
    !months.some((month) => {
      return b.BirthdayDate.includes(month);
    }) &&
    !/\d/.test(b.BirthdayDate)
  ) {
    if (
      !months.some((month) => {
        return a.BirthdayDate.includes(month);
      }) &&
      !/\d/.test(a.BirthdayDate)
    ) {
      return b.BirthdayDate - a.BirthdayDate;
    } else {
      return -1;
    }
  } else if (
    // All "Year only" dates get sorted down but above trash dates.
    !months.some((month) => {
      return a.BirthdayDate.includes(month);
    })
  ) {
    if (
      months.some((month) => {
        return b.BirthdayDate.includes(month);
      })
    ) {
      return 1;
    } else {
      return date1.getFullYear() - date2.getFullYear();
    }
  } else if (
    !months.some((month) => {
      return b.BirthdayDate.includes(month);
    })
  ) {
    if (
      months.some((month) => {
        return a.BirthdayDate.includes(month);
      })
    ) {
      return -1;
    } else {
      return date2.getFullYear() - date1.getFullYear();
    }
  } else if (/\d/.test(a.BirthdayDate) && /\d/.test(b.BirthdayDate)) {
    // All normal months with dates get sorted includeing sorted by year with the same date
    if (date1.getMonth() != date2.getMonth()) {
      // console.log(a.BirthdayDate + " | " + b.BirthdayDate);
      // console.log(
      //   date1.getMonth() +
      //     " | " +
      //     date2.getMonth() +
      //     " | " +
      //     new Date().getMonth()
      // );
      if (new Date().getMonth() > date1.getMonth()) {
        return 1;
      } else if (new Date().getMonth() > date2.getMonth()) {
        return -1;
      } else if (
        new Date().getMonth() == date1.getMonth() &&
        new Date().getDate() > date1.getDate()
      ) {
        console.log("equal Down");
        return 1;
      } else if (
        new Date().getMonth() == date2.getMonth() &&
        new Date().getDate() > date2.getDate()
      ) {
        console.log("equal Up");
        return -1;
      } else {
        console.log("Sorted");
        return date1.getMonth() - date2.getMonth();
      }
    }
    if (date1.getMonth() == date2.getMonth()) {
      if (date1.getDate() == date2.getDate()) {
        return date1.getFullYear() - date2.getFullYear();
      } else {
        return date1.getDate() - date2.getDate();
      }
    }
  } else {
    // All months without dates get sorted under months.
    if (!/\d/.test(a.BirthdayDate)) {
      date1 = new Date(
        months.find((month) => {
          return a.BirthdayDate.includes(month);
        }) + "1"
      );
    }
    if (!/\d/.test(b.BirthdayDate)) {
      date2 = new Date(
        months.find((month) => {
          return b.BirthdayDate.includes(month);
        }) + "1"
      );
    }
    if (date1.getMonth() < date2.getMonth()) {
      return -1;
    } else if (date1.getMonth() > date2.getMonth()) {
      return 1;
    } else if (
      date1.getMonth() == date2.getMonth() &&
      !/\d/.test(a.BirthdayDate)
    ) {
      return 1;
    } else if (
      date1.getMonth() == date2.getMonth() &&
      !/\d/.test(b.BirthdayDate)
    ) {
      return -1;
    }
  }
}

var initBDB_timer = 0;
// A function that will keep searching for a twitter's birthday date on the page and will create a (save birthday button) upon finding birthday date.
function initBDB() {
  var BDBElement = getBDBParent();
  initBDB_timer++;

  if (BDBElement != null) {
    setupBDB(BDBElement);
  } else if (initBDB_timer <= 300) {
    requestAnimationFrame(initBDB);
  } else {
    initBDB_timer = 0;
  }
}

// A function that makes creation od html elemnts easier just by parsing a string with html code.
function elementFromHtml(html) {
  const template = document.createElement("template");

  template.innerHTML = html.trim();

  return template.content.firstElementChild;
}

// A function that updates database by updating/creating/adding new items into it.
function UpdateData(
  eventsDatabase = [base_user_data],
  user_data = base_user_data
) {
  if (eventsDatabase.length >= 0) {
    if (
      (eventsDatabase == 0 ||
        eventsDatabase.find((el) => el.UserID == user_data.UserID) == null ||
        eventsDatabase.find((el) => el.UserID == user_data.UserID) == 0) &&
      eventsDatabase.find((el) => el.ID == user_data.ID) == null
    ) {
      eventsDatabase.push(user_data);
    } else {
      if (eventsDatabase.find((el) => el.UserID == user_data.UserID)) {
        eventsDatabase[
          eventsDatabase.findIndex((el) => el.UserID == user_data.UserID)
        ] = user_data;
      } else if (eventsDatabase.find((el) => el.ID == user_data.ID)) {
        eventsDatabase[
          eventsDatabase.findIndex((el) => el.ID == user_data.ID)
        ] = user_data;
      }
    }
    eventsDatabase.sort(dateComparison);
    eventsDatabase.forEach((value, index) => {
      value.ID = index + 1;
    });
    chrome.storage.sync.set({ save_file: eventsDatabase });
    update_closest_date();
  } else {
  }
}

// A function that replaces Birthday element on friend's page with a Birthday button that upon clicking will save friend's information (Name/ID/Birthday date/Icon) into the calendar.
function setupBDB(BDBElement) {
  if (BDBElement != null || BDBElement.children > 0) {
    let user_data = base_user_data;

    user_data.ID = 0;

    const birthday_button = document.createElement("a");
    birthday_button.className = "Birthday_button";

    birthday_button.onclick = function () {
      {
        var arrPrimary = Array.from(
          document.querySelectorAll('[alt="Opens profile photo"]')
        );
        user_data.Icon = arrPrimary.find((el) =>
          el.getElementsByTagName("img")
        ).src;
      }

      {
        var arrPrimary = Array.from(
          document.querySelectorAll('[data-testid="UserBirthdate"]')
        );
        user_data.BirthdayDate = arrPrimary
          .find((el) => el.getElementsByTagName("span"))
          .innerText.slice(5);
      }

      {
        var arrPrimary = Array.from(
          document.querySelectorAll('[data-testid="UserName"]')
        );
        user_data.Name = arrPrimary.find((el) =>
          el.getElementsByTagName("div")
        ).children[0].children[0].children[0].innerText;
      }

      {
        var arrPrimary = Array.from(
          document.querySelectorAll('[data-testid="UserName"]')
        );
        user_data.UserID = arrPrimary.find((el) =>
          el.getElementsByTagName("div")
        ).children[0].children[0].children[1].children[0].innerText;
      }

      chromeGetValue(save_file).then((result) => {
        UpdateData(result, user_data);
      });
    };

    birthday_button.appendChild(BDBElement.cloneNode(true));

    birthday_button.children[0].className = "custom_button";

    if (document.querySelectorAll('[class="Birthday_button"]').length == 0) {
      BDBElement.style.display = "none";
      Array.from(
        document.querySelectorAll('[data-testid="UserProfileHeader_Items"]')
      )
        .find((el) => el.getElementsByTagName("span"))
        .insertBefore(birthday_button, BDBElement);
    } else if (
      document.querySelectorAll('[class="Birthday_button"]').length != 0
    ) {
      birthday_button.children[0].style.display = "inline";
      Array.from(
        document.querySelectorAll('[data-testid="UserProfileHeader_Items"]')
      )
        .find((el) => el.getElementsByTagName("span"))
        .replaceChild(
          birthday_button,
          document.querySelector('[class="Birthday_button"]')
        );
    }
  }
}

// A function that creates and injects calendar button into twitter's side bar.
function setupCalendar(parentElement) {
  if (parentElement != null || parentElement.children > 0) {
    const calendar_button_holder = document.createElement("a");
    calendar_button_holder.className = "Calendar_button_holder";

    let CalendarButton = document.createElement("div");
    CalendarButton.className = "Calendar_button";

    const a = document.createElement("a");
    const calendar_button_img = document.createElement("img");
    calendar_button_img.src = chrome.runtime.getURL(
      "assets/images/calendar_icon.svg"
    );
    a.innerText = "Planner";

    calendar_button_holder.onclick = function () {
      if (!active) {
        document
          .querySelector('[class="Calendar_button"]')
          .querySelector("img").src = chrome.runtime.getURL(
          "assets/images/calendar_icon_fill.svg"
        );
      } else {
        document
          .querySelector('[class="Calendar_button"]')
          .querySelector("img").src = chrome.runtime.getURL(
          "assets/images/calendar_icon.svg"
        );
      }
      var mainElement = getMainParent();
      mainElement
        .getElementsByTagName("div")[0]
        .getElementsByTagName("div")[0].style.display = "flex";
      if (mainElement != null) {
        chromeGetValue(save_file).then((result) => {
          calendarPage(mainElement, result);
        });
      }
    };

    CalendarButton.appendChild(calendar_button_img);
    CalendarButton.appendChild(a);

    calendar_button_holder.appendChild(CalendarButton);

    parentElement.insertBefore(
      calendar_button_holder,
      parentElement.children[4]
    );

    update_closest_date();
  } else {
  }
}

// A function that updates number of days that is left untill next event.
function update_closest_date() {
  const closest_date = document.createElement("a");
  closest_date.className = "closest_date";
  chromeGetValue(save_file).then((result) => {
    if (result != null) {
      var year =
        new Date(result.sort(dateComparison)[0].BirthdayDate).getMonth() <
        new Date()
          ? 0
          : 1;

      closest_date.innerText =
        "" +
        Math.ceil(
          (new Date(result.sort(dateComparison)[0].BirthdayDate).getTime() -
            new Date(
              new Date().setFullYear(
                new Date(
                  result.sort(dateComparison)[0].BirthdayDate
                ).getFullYear() - year
              )
            ).getTime()) /
            (1000 * 3600 * 24)
        );
      if (document.querySelector('[class="closest_date"]') != null) {
        document.querySelector('[class="closest_date"]').remove();
      }
      document.querySelector('[class="Calendar_button"]').append(closest_date);
    }
  });
}

// Var to keep in it state of Calendar page if it's being closed or open.
var active = false;

// A function that creates calendar page by hiding main dif that contains all the content of the current page and will create a list of elements containing all saved data of friends you have saved into your Calendar.
function calendarPage(mainElement, users_db = [base_user_data]) {
  if (!active) {
    if (mainElement != null) {
      mainElement
        .getElementsByTagName("div")[0]
        .getElementsByTagName("div")[0].style.display = "none";

      active = !active;
      update_calendar_page(mainElement, users_db);
    }
  } else {
    if (mainElement != null) {
      mainElement
        .getElementsByTagName("div")[0]
        .getElementsByTagName("div")[0].style.display = "flex";

      mainElement
        .getElementsByTagName("div")[0]
        .getElementsByClassName("page_div")[0].style.display = "none";

      active = !active;
    }
  }
}

function check_fields(fields = base_user_data, user_fields) {
  user_fields
    .querySelector(`[id="birthday_date_input"]`)
    .classList.toggle("error", false);

  user_fields
    .querySelector(`[id="image_link_input"]`)
    .classList.toggle("error", false);

  user_fields
    .querySelector(`[id="name_input"]`)
    .classList.toggle("error", false);

  user_fields
    .querySelector(`[id="user_id_input"]`)
    .classList.toggle("error", false);

  var issues = [false, false, false, false];
  if (fields.BirthdayDate == "") {
    issues[0] = true;
  }
  if (fields.Icon == "") {
    user_fields.querySelector(`[id="image_link_input"]`).value =
      "https://c.tenor.com/bQuWIFsZWEgAAAAM/thurston-waffles-meow.gif";
  } else if (
    !/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
      user_fields.querySelector(`[id="image_link_input"]`).value
    )
  ) {
    issues[1] = true;
  }
  if (fields.Name == "") {
    issues[2] = true;
  }
  if (fields.UserID == "" || !/@/.test(fields.UserID)) {
    issues[3] = true;
  }

  if (issues[0]) {
    user_fields
      .querySelector(`[id="birthday_date_input"]`)
      .classList.toggle("error");
  }
  if (issues[1]) {
    user_fields
      .querySelector(`[id="image_link_input"]`)
      .classList.toggle("error");
  }
  if (issues[2]) {
    user_fields.querySelector(`[id="name_input"]`).classList.toggle("error");
  }
  if (issues[3]) {
    user_fields.querySelector(`[id="user_id_input"]`).classList.toggle("error");
  }
  return issues;
}

var errors_check;

// A function that updates calendar page by deleting existing content and creating a new list of elements with updated information as well as it assigns a delete button functions for each element.
function update_calendar_page(mainElement, users_db) {
  if (
    mainElement
      .getElementsByTagName("div")[0]
      .getElementsByClassName("page_div")[0] != null
  ) {
    mainElement
      .getElementsByTagName("div")[0]
      .getElementsByClassName("page_div")[0]
      .remove();
  }
  chromeGetValue(save_file).then((result) => {
    if (result != null) {
      chrome.storage.sync.set({ save_file: result.sort(dateComparison) });
    }
  });

  mainElement
    .getElementsByTagName("div")[0]
    .append(createCalendarPage(users_db.sort(dateComparison)));

  document
    .querySelector('[tag="save_new_birthday"]')
    .addEventListener("click", function () {
      var user_fields = document.querySelector(
        `[class*="birthday_event_creating_menu"]`
      );

      var update = base_user_data;
      update.ID = 0;
      update.Icon = user_fields.querySelector(`[id="image_link_input"]`).value;
      update.Name = user_fields.querySelector(`[id="name_input"]`).value;
      update.UserID = user_fields.querySelector(`[id="user_id_input"]`).value;
      update.BirthdayDate = user_fields.querySelector(
        `[id="birthday_date_input"]`
      ).value;

      errors_check = check_fields(update, user_fields);

      if (!errors_check.find((e) => e == true)) {
        chromeGetValue(save_file).then((result) => {
          UpdateData(result, update);
          update_calendar_page(getMainParent(), result);
        });
      }
    });
  document
    .querySelector('[tag="settings"]')
    .addEventListener("click", function () {});

  document
    .querySelector('[tag*="add_birthday_event"]')
    .addEventListener("click", function () {
      document
        .querySelector('[class*="birthday_event_creating_menu"]')
        .classList.toggle("is_open");

      document
        .querySelector('[class*="name_add_birthday"]')
        .classList.toggle("is_open");

      document
        .querySelector('[class*="utilities"]')
        .classList.toggle("is_open");
    });

  // finds and makes "more options" button to make options visible or hiding them depending on their state.
  var users = document.querySelectorAll('[class="more_button_holder"]');

  users.forEach((value) => {
    value.addEventListener("click", function () {
      value
        .querySelector(`[class*="delete_friend"]`)
        .classList.toggle("is_open");
      value.querySelector(`[class*="edit_friend"]`).classList.toggle("is_open");
      value
        .querySelector(`[class*="event_settings_button"]`)
        .classList.toggle("is_open");
    });

    // adds onClick functionality for each edit button of each user.
    value
      .querySelector('[tag="edit_friend"]')
      .addEventListener("click", function () {
        if (
          !document
            .querySelector(`[tag="menu_div_${value.id}"]`)
            .classList.toggle("is_open")
        )
          edit_friend(value.id);
      });

    // adds onClick functionality for each delete button of each user.
    value
      .querySelector('[tag="delete_friend"]')
      .addEventListener("click", function () {
        delete_friend(value.id);
      });

    value
      .querySelector('[tag="event_settings_button"]')
      .addEventListener("click", function () {
        if (
          !document
            .querySelector(`[tag="menu_div_${value.id}"]`)
            .classList.toggle("is_open")
        )
          openSettings(value.id);
      });
  });
}

function openSettings(UserID) {
  chromeGetValue(save_file).then((result) => {
    document
      .querySelector(`[tag="menu_div_${UserID}"]`)
      .classList.toggle("is_open");

    document
      .querySelector(`[class*="event_settings_${UserID}"]`)
      .classList.toggle("is_open");

    var user_fields = document.querySelector(
      `[class*="event_settings_${UserID}"]`
    );
    var user_fields_values = result.find((value) => {
      return value.UserID == UserID;
    });

    console.log(user_fields.getElementsByTagName(`input`)[0].checked);

    user_fields.getElementsByTagName(`input`)[0].checked =
      user_fields_values.settings.notification;
    user_fields.getElementsByTagName(`input`)[1].value =
      user_fields_values.settings.initial_start;
    user_fields.getElementsByTagName(`input`)[2].checked =
      user_fields_values.settings.once;
    user_fields.getElementsByTagName(`input`)[3].checked =
      user_fields_values.settings.daily;

    user_fields
      .getElementsByTagName(`input`)[0]
      .addEventListener("change", function () {
        user_fields_values.settings.notification =
          user_fields.getElementsByTagName(`input`)[0].checked;
        UpdateData(result, user_fields_values);
      });
    user_fields
      .getElementsByTagName(`input`)[1]
      .addEventListener("input", function () {
        user_fields_values.settings.initial_start =
          user_fields.getElementsByTagName(`input`)[1].value;
        UpdateData(result, user_fields_values);
      });
    user_fields
      .getElementsByTagName(`input`)[2]
      .addEventListener("change", function () {
        user_fields_values.settings.once =
          user_fields.getElementsByTagName(`input`)[2].checked;
        UpdateData(result, user_fields_values);
      });
    user_fields
      .getElementsByTagName(`input`)[3]
      .addEventListener("change", function () {
        user_fields_values.settings.daily =
          user_fields.getElementsByTagName(`input`)[3].checked;
        UpdateData(result, user_fields_values);
      });
  });
}

// A function that created the base of the Calendar page that contains all list items.
function createCalendarPage(array = [base_user_data]) {
  const ul = document.createElement("ul");

  var new_year = true;
  var unknown = true;

  const svg_arrow_down = document.createElement("img");

  svg_arrow_down.src = chrome.runtime.getURL(
    "assets/images/arrow_downward_icon.svg"
  );
  if (array.length > 0 && array[0].ID != 0) {
    array.forEach((x, i) => {
      if (
        new_year &&
        new Date(x.BirthdayDate).getMonth() < new Date().getMonth()
      ) {
        ul.appendChild(
          elementFromHtml(
            `
              <div class="dates_div">
                <div>Next Year</div>
                ${svg_arrow_down.outerHTML}
              </div>
            `
          )
        );
        new_year = false;
      }
      if (
        unknown &&
        !months.some((month) => {
          return x.BirthdayDate.includes(month);
        }) &&
        !/\d/.test(x.BirthdayDate)
      ) {
        ul.appendChild(
          elementFromHtml(
            `
              <div class="dates_div">
                <div>Unknown Dates</div>
                ${svg_arrow_down.outerHTML}
              </div>
            `
          )
        );
      }
      ul.appendChild(createListItem(x));
    });
  }

  return elementFromHtml(
    `
      <div class="page_div">
        <div class="wrapper">
          <div class="list_wrap">
            <div class="utilities">
              <div class="util_tab">
                <div class="icon_holder" tag="settings">
                  <img
                    src="${chrome.runtime.getURL(
                      "assets/images/settings_icon.svg"
                    )}"
                  />
                </div>
                <div class="icon_holder" tag="add_birthday_event">
                  <img
                    src="${chrome.runtime.getURL(
                      "assets/images/add_new_user_icon.svg"
                    )}"
                  />
                </div>
                <div class="name_of_utility_holder">
                  <div class="name_settings utility_name">Settings</div>
                  <div class="name_add_birthday utility_name">
                    Add New Birthday
                  </div>
                </div>
              </div>
              <div class="settings"></div>
              <div class="birthday_event_creating_menu">
                <div class="edit_fields">
                  <div class="edit_field">
                    <div>Image Link:</div>
                    <input id="image_link_input" />
                  </div>
                  <div class="edit_field">
                    <div>Name:</div>
                    <input id="name_input" />
                  </div>
                  <div class="edit_field">
                    <div>User ID:</div>
                    <input id="user_id_input" />
                  </div>
                  <div class="edit_field">
                    <div>Birthday date:</div>
                    <input id="birthday_date_input" />
                  </div>
                </div>
                <div class="save_changes" tag="save_new_birthday">
                  <img
                    class="calendar_icons_svg"
                    src="${chrome.runtime.getURL(
                      "assets/images/save_icon.svg"
                    )}"
                  />
                </div>
              </div>
            </div>
            ${ul.outerHTML}
          </div>
        </div>
        <div class="suggestions_div"></div>
      </div>
    `
  );
}

// A function that deletes item with matching UserID from database.
function delete_friend(UserID = base_user_data.UserID) {
  chromeGetValue(save_file).then((result) => {
    const index = result.findIndex((object) => {
      return object.UserID == UserID;
    });
    result.splice(index, 1);
    chrome.storage.sync.set({ save_file: result });
    update_calendar_page(getMainParent(), result);
  });
}

// A function that opens and closes edit menu as well as it pastes already existing values into the fields for user to edit.
function edit_friend(UserID = base_user_data.UserID) {
  chromeGetValue(save_file).then((result) => {
    document
      .querySelector(`[tag="menu_div_${UserID}"]`)
      .classList.toggle("is_open");

    document
      .querySelector(`[tag="editing_menu_${UserID}"]`)
      .classList.toggle("is_open");

    var user_fields = document.querySelector(`[tag="editing_menu_${UserID}"]`);
    var user_fields_values = result.find((value) => {
      return value.UserID == UserID;
    });

    user_fields.querySelector(`[id="image_link_input"]`).value =
      user_fields_values.Icon;
    user_fields.querySelector(`[id="name_input"]`).value =
      user_fields_values.Name;
    user_fields.querySelector(`[id="user_id_input"]`).value =
      user_fields_values.UserID;
    user_fields.querySelector(`[id="birthday_date_input"]`).value =
      user_fields_values.BirthdayDate;

    // adds onClick functionality for save_edit button of friend.
    user_fields
      .querySelector('[class="save_changes"]')
      .addEventListener("click", function () {
        save_edit(user_fields_values);
      });
  });
}

// A function that saves all edited data into DataBase.
function save_edit(user_fields_values = base_user_data) {
  if (user_fields_values.ID != 0) {
    var user_fields = document.querySelector(
      `[tag="editing_menu_${user_fields_values.UserID}"]`
    );
    var update = base_user_data;
    update.ID = user_fields_values.ID;
    update.Icon = user_fields.querySelector(`[id="image_link_input"]`).value;
    update.Name = user_fields.querySelector(`[id="name_input"]`).value;
    update.UserID = user_fields.querySelector(`[id="user_id_input"]`).value;
    update.BirthdayDate = user_fields.querySelector(
      `[id="birthday_date_input"]`
    ).value;

    errors_check = check_fields(update, user_fields);

    if (!errors_check.find((e) => e == true)) {
      chromeGetValue(save_file).then((result) => {
        UpdateData(result, update);
        update_calendar_page(getMainParent(), result);
      });
    }
  }
}

// A function that creates each list item that contains all friend's information and UI elements with all it's classes.
function createListItem(user_object = base_user_data) {
  return elementFromHtml(
    `
      <li class="user">
        <div>
          <div class="edit_div" tag="menu_div_${user_object.UserID}">
            <a href="${"https://twitter.com/" + user_object.UserID}">
              <div class="list">
                <img class="icon" src="${user_object.Icon}" />
                <div class="content">
                  <div class="n_id_div">
                    <div class="list_item_name">${user_object.Name}</div>
                    <div class="list_item_id">${user_object.UserID}</div>
                  </div>
                  <p class="list_item_bd">${user_object.BirthdayDate}</p>
                </div>
              </div>
            </a>
            <div class="editing_menu" tag="editing_menu_${user_object.UserID}">
              <div class="edit_fields">
                <div class="edit_field">
                  <div>Image Link:</div>
                  <input id="image_link_input" />
                </div>
                <div class="edit_field">
                  <div>Name:</div>
                  <input id="name_input" />
                </div>
                <div class="edit_field">
                  <div>User ID:</div>
                  <input id="user_id_input" />
                </div>
                <div class="edit_field">
                  <div>Birthday date:</div>
                  <input id="birthday_date_input" />
                </div>
              </div>
              <div class="save_changes">
                <img
                  class="calendar_icons_svg"
                  src="${chrome.runtime.getURL("assets/images/save_icon.svg")}"
                />
              </div>
            </div>
            <div class="event_settings event_settings_${user_object.UserID}">
              <div>
                <label class="toggle_container"
                  >Notifications:
                  <input type="checkbox" checked="checked" />
                  <span class="checkmark"></span>
                </label>
                <p>When do you want to start recieving notifications?<input type="number" id="notif_start" step="1" min="1" max="365" placeholder="1 - 365"/>
                </p>
                <label class="toggle_container"
                  >Onece
                  <input type="checkbox" checked="checked" />
                  <span class="checkmark"></span>
                </label>
                <label class="toggle_container"
                  >Daily
                  <input type="checkbox" checked="checked" />
                  <span class="checkmark"></span>
                </label>
              </div>
            </div>
          </div>

          <a class="more_button_holder" id="${user_object.UserID}">
            <div class="calendar_icons_button more_options" tag="more_options">
              <img
                class="calendar_icons_svg"
                src="${chrome.runtime.getURL(
                  "assets/images/more_options_icon.svg"
                )}"
              />
            </div>
            <div
              class="calendar_icons_button options_button delete_friend"
              tag="delete_friend"
            >
              <img
                class="calendar_icons_svg"
                src="${chrome.runtime.getURL("assets/images/delete_icon.svg")}"
              />
            </div>
            <div
              class="calendar_icons_button options_button edit_friend"
              tag="edit_friend"
            >
              <img
                class="calendar_icons_svg"
                src="${chrome.runtime.getURL("assets/images/edit_icon.svg")}"
              />
            </div>

            <div
              class="calendar_icons_button options_button event_settings_button"
              tag="event_settings_button"
            >
              <img
                class="calendar_icons_svg"
                src="${chrome.runtime.getURL(
                  "assets/images/settings_icon.svg"
                )}"
              />
            </div>
          </a>
        </div>
      </li>
    `
  );
}
