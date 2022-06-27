// Variable that saves key for chrome.storage to manage data in it.
const save_file = "save_file";

// Blank for item in data-base.
let base_user_data = {
  ID: "0",
  Icon: "",
  Name: "",
  UserID: "",
  BirthdayDate: "",
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
];
// A function that will allow us to sort dates in order.
function dateComparison(a, b) {
  let date1 = new Date(a.BirthdayDate);
  let date2 = new Date(b.BirthdayDate);

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
    if (date1.getMonth() != date2.getMonth()) {
      return date1.getMonth() - date2.getMonth();
    }
    if (date1.getMonth() == date2.getMonth()) {
      if (date1.getDate() == date2.getDate()) {
        return date1.getFullYear() - date2.getFullYear();
      } else {
        return date1.getDate() - date2.getDate();
      }
    }
  } else {
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

// A function that will keep searching for a twitter's birthday date on the page and will create a (save birthday button) upon finding birthday date.
function initBDB() {
  var BDBElement = getBDBParent();

  if (BDBElement != null) {
    setupBDB(BDBElement);
  } else {
    requestAnimationFrame(initBDB);
  }
}

// A function that makes creation od html elemnts easier just by parsing a string with html code.
function elementFromHtml(html) {
  const template = document.createElement("template");

  template.innerHTML = html.trim();

  return template.content.firstElementChild;
}

// A function that updates database by updating/creating/adding new items into it.
function UpdateData(usersArray = [base_user_data], user_data = base_user_data) {
  if (usersArray.length >= 0) {
    if (
      (usersArray == 0 ||
        usersArray.find((el) => el.UserID == user_data.UserID) == null ||
        usersArray.find((el) => el.UserID == user_data.UserID) == 0) &&
      usersArray.find((el) => el.ID == user_data.ID) == null
    ) {
      usersArray.push(user_data);
    } else {
      if (usersArray.find((el) => el.UserID == user_data.UserID)) {
        usersArray[
          usersArray.findIndex((el) => el.UserID == user_data.UserID)
        ] = user_data;
      } else if (usersArray.find((el) => el.ID == user_data.ID)) {
        usersArray[usersArray.findIndex((el) => el.ID == user_data.ID)] =
          user_data;
      }
    }
    usersArray.sort(dateComparison);
    usersArray.forEach((value, index) => {
      value.ID = index + 1;
    });
    chrome.storage.sync.set({ save_file: usersArray });
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

    CalendarButton.onclick = function () {
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
  } else {
  }
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

  // finds and makes "more options" button to make options visible or hiding them depending on their state.
  var users = document.querySelectorAll('[class="more_button_holder"]');

  users.forEach((value) => {
    value.addEventListener("click", function () {
      value
        .querySelector(`[class*="delete_friend"]`)
        .classList.toggle("is_open");
      value.querySelector(`[class*="edit_friend"]`).classList.toggle("is_open");
    });

    // adds onClick functionality for each edit button of each user.
    value
      .querySelector('[tag="edit_friend"]')
      .addEventListener("click", function () {
        edit_friend(value.id);
      });

    // adds onClick functionality for each delete button of each user.
    value
      .querySelector('[tag="delete_friend"]')
      .addEventListener("click", function () {
        delete_friend(value.id);
      });
  });
}

// A function that created the base of the Calendar page that contains all list items.
function createCalendarPage(array = [base_user_data]) {
  const ul = document.createElement("ul");

  if (array.length > 0 && array[0].ID != 0) {
    array.forEach((x, i) => ul.appendChild(createListItem(x)));
  }

  return elementFromHtml(
    `
      <div class="page_div">
        <div class="wrapper">
          <div class="list_wrap">${ul.outerHTML}</div>
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
      .querySelector(`[tag="edit_div_${UserID}"]`)
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
    chromeGetValue(save_file).then((result) => {
      UpdateData(result, update);
      update_calendar_page(getMainParent(), result);
    });
  }
}

// A function that creates each list item that contains all friend's information and UI elements with all it's classes.
function createListItem(user_object = base_user_data) {
  return elementFromHtml(
    `
      <li class="user">
        <div>
          <div class="edit_div" tag="edit_div_${user_object.UserID}">
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
              class="calendar_icons_button delete_friend"
              tag="delete_friend"
            >
              <img
                class="calendar_icons_svg"
                src="${chrome.runtime.getURL("assets/images/delete_icon.svg")}"
              />
            </div>
            <div class="calendar_icons_button edit_friend" tag="edit_friend">
              <img
                class="calendar_icons_svg"
                src="${chrome.runtime.getURL("assets/images/edit_icon.svg")}"
              />
            </div>
          </a>
        </div>
      </li>
    `
  );
}
