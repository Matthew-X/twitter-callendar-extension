import {
  chromeGetValue,
  base_user_data,
  user_data,
  save_file,
  messages,
} from "./basics";
import { dateComparison, months } from "./datesBasics";

// A function that that retrieves a Main-Parent of twitter's left side bar with all the buttons to navigate between pages like (home, messages, bookmarks).
function getParent(): HTMLElement | null {
  var arrPrimary = Array.from(
    document.querySelectorAll('[aria-label="Primary"]')
  );
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find(
    (el) => el.getAttribute("role") == "navigation"
  ) as HTMLElement;
}

// A function that retrieves Main-Parent of the page (everyhting that is on the right from twitter's left side bar).
function getMainParent() {
  var arrPrimary = Array.from(document.querySelectorAll('[role="main"]'));
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find((el) => el.getElementsByTagName("div")[0]);
}

// A function that retrieves a (birthday element that already exists on the page (if exists)) and then returns it's content.
function getBDBParent(): HTMLElement | null {
  var arrPrimary = Array.from(
    document.querySelectorAll('[data-testid="UserBirthdate"]')
  );
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find((el) => {
    if (el.classList.contains("custom_button")) {
      if (arrPrimary.length == 1) {
        document.querySelector('[class="Birthday_button"]')?.remove();
      }
    } else {
      return el.getElementsByTagName("span");
    }
  }) as HTMLElement;
}

// A part of code that initiates the piece of code that creates Calendar button & Birthday save button.
requestAnimationFrame(function () {
  initCalendarButton();
  initBDB();
});

// A function that will keep searching for a twitter's left side bar in order to parse it into the function to inject Calendar button into that bar.
function initCalendarButton() {
  var parentElement = getParent();

  if (parentElement != null) {
    setupCalendar(parentElement);
  } else {
    requestAnimationFrame(initCalendarButton);
  }
}

// Variable that saves initial page's url/href upon loading on the page.
var oldHref = document.location.href;

// Piece of code that upon loading starts an observer that tracks every change on the page and upon url change it re-initiates function that make's Birthday button to appear.
window.onload = function () {
  var bodyList = document.querySelector("body")!;

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        if (document.querySelector('[class="page_div"]') != null) {
          document.querySelector('[class="page_div"]')?.remove();
          if (
            getMainParent()!
              .getElementsByTagName("div")[0]
              .getElementsByTagName("div")[0].style.display == "none"
          ) {
            getMainParent()!
              .getElementsByTagName("div")[0]
              .getElementsByTagName("div")[0].style.display = "flex";
          }
        }
        if (active) {
          active = !active;
          document
            .querySelector('[class="Calendar_button"]')!
            .querySelector("img")!.src = chrome.runtime.getURL(
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
function elementFromHtml(html: string): Element {
  const template = document.createElement("template");

  template.innerHTML = html.trim();

  return template.content.firstElementChild!;
}

// A function that updates database by updating/creating/adding new items into it.
function UpdateData(
  eventsDatabase: user_data[] = [],
  user_data = { ...base_user_data }
) {
  if (eventsDatabase.length >= 0) {
    if (
      (eventsDatabase.length == 0 ||
        eventsDatabase.find((el) => el.UserID == user_data.UserID) == null) &&
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
  }
}

// A function that replaces Birthday element on friend's page with a Birthday button that upon clicking will save friend's information (Name/ID/Birthday date/Icon) into the calendar.
function setupBDB(BDBElement: HTMLElement | null) {
  if (BDBElement != null || BDBElement!.children.length > 0) {
    let user_data = { ...base_user_data };

    user_data.ID = 0;

    const birthday_button = document.createElement("a");
    birthday_button.className = "Birthday_button";

    birthday_button.onclick = function () {
      {
        var arrPrimary = Array.from(
          document.querySelectorAll('[alt="Opens profile photo"]')
        );
        user_data.Icon = (
          arrPrimary.find((el) =>
            el.getElementsByTagName("img")
          ) as HTMLImageElement
        ).src as string;
      }

      {
        var arrPrimary = Array.from(
          document.querySelectorAll('[data-testid="UserBirthdate"]')
        );
        console.log(arrPrimary);
        user_data.BirthdayDate = (
          arrPrimary.find((el) =>
            el.getElementsByTagName("span")
          ) as HTMLElement
        ).innerText.slice(5);
      }

      {
        var arrPrimary = Array.from(
          document.querySelectorAll('[data-testid="UserName"]')
        );
        user_data.Name = (
          (arrPrimary.find((el) => el.getElementsByTagName("div")) as Element)
            .children[0].children[0].children[0] as HTMLElement
        ).innerText;
      }

      {
        var arrPrimary = Array.from(
          document.querySelectorAll('[data-testid="UserName"]')
        );
        user_data.UserID = (
          (arrPrimary.find((el) => el.getElementsByTagName("div")) as Element)
            .children[0].children[0].children[1].children[0] as HTMLElement
        ).innerText;
      }

      chromeGetValue(save_file).then((result) => {
        UpdateData(result!, user_data);
      });
    };

    birthday_button.appendChild(BDBElement!.cloneNode(true));

    birthday_button.children[0].className = "custom_button";

    if (document.querySelectorAll('[class="Birthday_button"]').length == 0) {
      BDBElement!.style.display = "none";
      (
        Array.from(
          document.querySelectorAll('[data-testid="UserProfileHeader_Items"]')
        ).find((el) => el.getElementsByTagName("span")) as HTMLElement
      ).insertBefore(birthday_button, BDBElement);
    } else if (
      document.querySelectorAll('[class="Birthday_button"]').length != 0
    ) {
      (birthday_button.children[0] as HTMLElement).style.display = "inline";
      (
        Array.from(
          document.querySelectorAll('[data-testid="UserProfileHeader_Items"]')
        ).find((el) => el.getElementsByTagName("span")) as HTMLElement
      ).replaceChild(
        birthday_button,
        document.querySelector('[class="Birthday_button"]') as HTMLElement
      );
    }
  }
}

// A function that creates and injects calendar button into twitter's side bar.
function setupCalendar(parentElement: HTMLElement | null) {
  if (parentElement != null || parentElement!.children.length > 0) {
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
        (
          (
            document.querySelector('[class="Calendar_button"]') as HTMLElement
          ).querySelector("img") as HTMLImageElement
        ).src = chrome.runtime.getURL("assets/images/calendar_icon_fill.svg");
      } else {
        (
          (
            document.querySelector('[class="Calendar_button"]') as HTMLElement
          ).querySelector("img") as HTMLImageElement
        ).src = chrome.runtime.getURL("assets/images/calendar_icon.svg");
      }
      var mainElement = getMainParent();
      mainElement!
        .getElementsByTagName("div")[0]
        .getElementsByTagName("div")[0].style.display = "flex";
      if (mainElement != null) {
        chromeGetValue(save_file).then((result) => {
          calendarPage(mainElement, result!);
        });
      }
    };

    CalendarButton.appendChild(calendar_button_img);
    CalendarButton.appendChild(a);

    calendar_button_holder.appendChild(CalendarButton);

    parentElement!.insertBefore(
      calendar_button_holder,
      parentElement!.children[4]
    );

    update_closest_date();
  } else {
  }
}

// A function that updates number of days that is left untill next event.
function update_closest_date() {
  var date: Date;
  var closestDate: user_data;
  const closest_date = document.createElement("a");
  closest_date.className = "closest_date";
  chromeGetValue(save_file).then((result) => {
    if (result != null && result.length > 0) {
      result = result.sort(dateComparison);
      closestDate = { ...result[0] };
    }
    if (result != null && result.length > 0) {
      // finding out if event happening this or next year
      if (
        months.some((month) => {
          var RegExMonth = new RegExp("\\b" + month + "\\b");
          return RegExMonth.test(closestDate.BirthdayDate.toLowerCase());
        }) &&
        !/\d/.test(closestDate.BirthdayDate)
      ) {
        date = new Date(
          months.find((month) => {
            var RegExMonth = new RegExp("\\b" + month + "\\b");
            return RegExMonth.test(closestDate.BirthdayDate.toLowerCase());
          }) + "1"
        );
      } else {
        date = new Date(closestDate.BirthdayDate);
      }
      var year =
        date.getMonth() < new Date().getMonth()
          ? 1
          : 0 || date.getMonth() == new Date().getMonth()
          ? date.getDate() < new Date().getDate()
            ? 1
            : 0
          : 0;

      console.log(year);

      closest_date.innerText =
        "" +
        Math.ceil(
          (date.getTime() -
            new Date(
              new Date().setFullYear(date.getFullYear() - year)
            ).getTime()) /
            (1000 * 3600 * 24)
        );

      if (document.querySelector('[class="closest_date"]') != null) {
        document.querySelector('[class="closest_date"]')!.remove();
      }
      if (
        months.some((month) => {
          var RegExMonth = new RegExp("\\b" + month + "\\b");
          return RegExMonth.test(result![0].BirthdayDate.toLowerCase());
        })
      ) {
        document
          .querySelector('[class="Calendar_button"]')!
          .append(closest_date);
      }
    } else if (document.querySelector('[class="closest_date"]') != null) {
      document.querySelector('[class="closest_date"]')!.remove();
    }
  });
}

// Var to keep in it state of Calendar page if it's being closed or open.
var active = false;

// A function that creates calendar page by hiding main dif that contains all the content of the current page and will create a list of elements containing all saved data of friends you have saved into your Calendar.
function calendarPage(
  mainElement: Element | null | undefined,
  users_db: user_data[]
) {
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

      (
        mainElement
          .getElementsByTagName("div")[0]
          .getElementsByClassName("page_div")[0] as HTMLElement
      ).style.display = "none";

      active = !active;
    }
  }
}

function check_fields(
  fields = { ...base_user_data },
  user_fields: Element | null
) {
  user_fields!
    .querySelector(`[id="birthday_date_input"]`)!
    .classList.toggle("error", false);

  user_fields!
    .querySelector(`[id="image_link_input"]`)!
    .classList.toggle("error", false);

  user_fields!
    .querySelector(`[id="name_input"]`)!
    .classList.toggle("error", false);

  user_fields!
    .querySelector(`[id="user_id_input"]`)!
    .classList.toggle("error", false);

  var issues = [false, false, false, false];
  if (fields.BirthdayDate == "") {
    issues[0] = true;
  }
  if (fields.Icon == "") {
    (
      user_fields!.querySelector(`[id="image_link_input"]`)! as HTMLInputElement
    ).value = "https://c.tenor.com/bQuWIFsZWEgAAAAM/thurston-waffles-meow.gif";
    fields.Icon =
      "https://c.tenor.com/bQuWIFsZWEgAAAAM/thurston-waffles-meow.gif";
  } else if (
    !/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
      (
        user_fields!.querySelector(
          `[id="image_link_input"]`
        )! as HTMLInputElement
      ).value
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
    user_fields!
      .querySelector(`[id="birthday_date_input"]`)!
      .classList.toggle("error");
  }
  if (issues[1]) {
    user_fields!
      .querySelector(`[id="image_link_input"]`)!
      .classList.toggle("error");
  }
  if (issues[2]) {
    user_fields!.querySelector(`[id="name_input"]`)!.classList.toggle("error");
  }
  if (issues[3]) {
    user_fields!
      .querySelector(`[id="user_id_input"]`)!
      .classList.toggle("error");
  }
  return issues;
}

var errors_check;
var b_util_menu = { settings: false, add_birthday: false };

// A function that updates calendar page by deleting existing content and creating a new list of elements with updated information as well as it assigns a delete button functions for each element.
function update_calendar_page(
  mainElement: Element | null | undefined,
  users_db: user_data[] | null | undefined
) {
  chrome.runtime.sendMessage(messages.notificationsUpdate);
  if (
    mainElement!
      .getElementsByTagName("div")[0]
      .getElementsByClassName("page_div")[0] != null
  ) {
    mainElement!
      .getElementsByTagName("div")[0]
      .getElementsByClassName("page_div")[0]
      .remove();
  }
  chromeGetValue(save_file).then((result) => {
    if (result != null && result.length > 1)
      chrome.storage.sync.set({ save_file: result.sort(dateComparison) });
  });

  mainElement!
    .getElementsByTagName("div")[0]
    .append(
      createCalendarPage(
        users_db != null && users_db.length > 1
          ? users_db.sort(dateComparison)
          : users_db
      ) as HTMLElement
    );

  // Sets click listener for saving new birthday buttons
  document!
    .querySelector('[tag="save_new_birthday"]')!
    .addEventListener("click", function () {
      var user_fields = document.querySelector(
        `[class*="birthday_event_creating_menu"]`
      );

      var update = { ...base_user_data };
      update.ID = 0;
      update.Icon = (user_fields!.querySelector(
        `[id="image_link_input"]`
      ) as HTMLInputElement)!.value;
      update.Name = (user_fields!.querySelector(
        `[id="name_input"]`
      ) as HTMLInputElement)!.value;
      update.UserID = (user_fields!.querySelector(
        `[id="user_id_input"]`
      ) as HTMLInputElement)!.value;
      update.BirthdayDate = (user_fields!.querySelector(
        `[id="birthday_date_input"]`
      ) as HTMLInputElement)!.value;

      errors_check = check_fields(update, user_fields);

      if (!errors_check.find((e) => e == true)) {
        UpdateData(users_db!, update);
        chromeGetValue(save_file).then((result) => {
          update_calendar_page(getMainParent(), result);
        });
      }
    });

  // Button to delete all events from database
  document!
    .querySelector('[class*="reset_button"]')!
    .addEventListener("click", function () {
      chrome.storage.sync.clear();
      chromeGetValue(save_file).then((result) => {
        update_calendar_page(getMainParent(), result);
      });
    });

  // assigns functionality for settings button to open it's menus
  document!
    .querySelector('[tag*="settings"]')!
    .addEventListener("click", function () {
      if (b_util_menu.add_birthday) {
        document!
          .querySelector('[class*="birthday_event_creating_menu"]')!
          .classList.toggle("is_open", false);

        document!
          .querySelector('[class*="name_add_birthday"]')!
          .classList.toggle("is_open", false);

        document!
          .querySelector('[class*="utilities"]')!!
          .classList.toggle("is_open", false);
        b_util_menu.add_birthday = !b_util_menu.add_birthday;
      }
      document!
        .querySelector('[class*="main_settings_menu"]')!!
        .classList.toggle("is_open");

      document!
        .querySelector('[class*="name_settings"]')!!
        .classList.toggle("is_open");

      document!
        .querySelector('[class*="utilities"]')!
        .classList.toggle("is_open");
      b_util_menu.settings = !b_util_menu.settings;
    });
  // assigns for add birthdays button in the utilities menu functionality to open menus
  document!
    .querySelector('[tag*="add_birthday_event"]')!
    .addEventListener("click", function () {
      if (b_util_menu.settings) {
        document!
          .querySelector('[class*="main_settings_menu"]')!
          .classList.toggle("is_open", false);

        document!
          .querySelector('[class*="name_settings"]')!
          .classList.toggle("is_open", false);

        document!
          .querySelector('[class*="utilities"]')!
          .classList.toggle("is_open", false);
        b_util_menu.settings = !b_util_menu.settings;
      }
      document!
        .querySelector('[class*="birthday_event_creating_menu"]')!
        .classList.toggle("is_open");

      document!
        .querySelector('[class*="name_add_birthday"]')!
        .classList.toggle("is_open");

      document!
        .querySelector('[class*="utilities"]')!
        .classList.toggle("is_open");
      b_util_menu.add_birthday = !b_util_menu.add_birthday;
    });

  // finds and makes "more options" button to make options visible or hiding them depending on their state.
  var users = document.querySelectorAll('[class="more_button_holder"]');

  // sets all onClick events for "more" buttons
  users.forEach((value) => {
    // makes other buttons visible
    value.addEventListener("click", function () {
      value!
        .querySelector(`[class*="delete_friend"]`)!
        .classList.toggle("is_open");
      value!
        .querySelector(`[class*="edit_friend"]`)!
        .classList.toggle("is_open");
      value!
        .querySelector(`[class*="event_settings_button"]`)!
        .classList.toggle("is_open");

      // disables event settings button for events without any specified date
      users_db!.forEach((x, i) => {
        if (
          value.id == x.UserID &&
          !months.some((month) => {
            var RegExMonth = new RegExp("\\b" + month + "\\b");
            return RegExMonth.test(x.BirthdayDate.toLowerCase());
          })
        ) {
          value!
            .querySelector(`[class*="event_settings_button"]`)!
            .classList.toggle("is_open", false);
        }
      });
    });

    // adds onClick functionality for each edit button of each user.
    value!
      .querySelector('[tag="edit_friend"]')!
      .addEventListener("click", function () {
        edit_friend(value.id);
      });

    // adds onClick functionality for each delete button of each user.
    value!
      .querySelector('[tag="delete_friend"]')!
      .addEventListener("click", function () {
        delete_friend(value.id);
      });

    // adds onClick functionality for each settings button of each user.

    value!
      .querySelector('[tag="event_settings_button"]')!
      .addEventListener("click", function () {
        openSettings(value.id);
      });
  });
  update_closest_date();
}

var a_more_options_menus: { ID: any; edit: boolean; settings: boolean }[] = [];

function openSettings(UserID: string) {
  chromeGetValue(save_file).then((result) => {
    if (
      !a_more_options_menus.some((x, i) => {
        x.ID == UserID;
      })
    ) {
      a_more_options_menus.push({ ID: UserID, edit: false, settings: false });
    }
    if (
      a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.edit
    ) {
      document
        .querySelector(`[tag="menu_div_${UserID}"]`)!
        .classList.toggle("is_open", false);
      a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.settings = !a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.settings;
    } else {
      a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.settings = !a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.settings;
    }
    document
      .querySelector(`[tag="menu_div_${UserID}"]`)!
      .classList.toggle("is_open");

    document
      .querySelector(`[class*="event_settings_${UserID}"]`)!
      .classList.toggle("is_open");

    var user_fields = document.querySelector(
      `[class*="event_settings_${UserID}"]`
    )!;
    var user_fields_values = result.find((value) => {
      return value.UserID == UserID;
    })!;

    if (user_fields_values.settings.notification) {
      user_fields
        .querySelectorAll(`[class*="notifications_settings"]`)[0]
        .classList.toggle("is_open", true);
      user_fields
        .querySelectorAll(`[class*="notifications_settings"]`)[1]
        .classList.toggle("is_open", true);
    }

    user_fields.getElementsByTagName(`input`)[0].checked =
      user_fields_values.settings.notification;
    user_fields.getElementsByTagName(`input`)[1].value =
      user_fields_values.settings.initial_start.toString();
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
        user_fields
          .querySelectorAll(`[class*="notifications_settings"]`)[0]
          .classList.toggle("is_open");
        user_fields
          .querySelectorAll(`[class*="notifications_settings"]`)[1]
          .classList.toggle("is_open");
      });
    user_fields
      .getElementsByTagName(`input`)[1]
      .addEventListener("input", function () {
        user_fields_values.settings.initial_start =
          user_fields.getElementsByTagName(`input`)[1]
            .value as unknown as number;
        user_fields_values.notification.last_date = new Date("1980").getTime();
        UpdateData(result, user_fields_values);
      });
    user_fields
      .getElementsByTagName(`input`)[2]
      .addEventListener("change", function () {
        user_fields_values.settings.once =
          user_fields.getElementsByTagName(`input`)[2].checked;
        user_fields_values.settings.daily =
          !user_fields.getElementsByTagName(`input`)[2].checked;
        user_fields.getElementsByTagName(`input`)[3].checked =
          !user_fields.getElementsByTagName(`input`)[2].checked;
        UpdateData(result, user_fields_values);
      });
    user_fields
      .getElementsByTagName(`input`)[3]
      .addEventListener("change", function () {
        user_fields_values.settings.daily =
          user_fields.getElementsByTagName(`input`)[3].checked;
        user_fields_values.settings.once =
          !user_fields.getElementsByTagName(`input`)[3].checked;
        user_fields.getElementsByTagName(`input`)[2].checked =
          !user_fields.getElementsByTagName(`input`)[3].checked;
        UpdateData(result, user_fields_values);
      });
  });
}

// A function that created the base of the Calendar page that contains all list items.
function createCalendarPage(array: user_data[] | null | undefined) {
  const ul = document.createElement("ul");

  var next_year = true;
  var unknown = true;

  const svg_arrow_down = document.createElement("img");

  svg_arrow_down.src = chrome.runtime.getURL(
    "assets/images/arrow_downward_icon.svg"
  );

  if (array != null && array!.length > 0 && array![0].ID != 0) {
    array!.forEach((x, i) => {
      var date = new Date(x.BirthdayDate);
      if (!/\d/.test(x.BirthdayDate)) {
        date = new Date(
          months.find((month) => {
            var RegExMonth = new RegExp("\\b" + month + "\\b");
            return RegExMonth.test(x.BirthdayDate.toLowerCase());
          }) + " 1"
        );
      }
      if (
        next_year &&
        months.some((month) => {
          var RegExMonth = new RegExp("\\b" + month + "\\b");
          return RegExMonth.test(x.BirthdayDate.toLowerCase());
        }) &&
        (date.getMonth() < new Date().getMonth() ||
          (date.getMonth() == new Date().getMonth() &&
            new Date().getDate() > date.getDate()))
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
        next_year = false;
      }
      if (
        unknown &&
        !months.some((month) => {
          var RegExMonth = new RegExp("\\b" + month + "\\b");
          return RegExMonth.test(x.BirthdayDate.toLowerCase());
        })
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
        unknown = false;
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
              <div class="settings">
                <div class="main_settings_menu">
                  <button class="reset_button">Reset All</button>
                </div>
              </div>
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
function delete_friend(UserID = { ...base_user_data }.UserID) {
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
function edit_friend(UserID = { ...base_user_data }.UserID) {
  chromeGetValue(save_file).then((result) => {
    if (
      !a_more_options_menus.some((x, i) => {
        x.ID == UserID;
      })
    ) {
      a_more_options_menus.push({ ID: UserID, edit: false, settings: false });
    }
    if (
      a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.settings
    ) {
      document
        .querySelector(`[tag="menu_div_${UserID}"]`)!
        .classList.toggle("is_open", false);
      a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.edit = !a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.edit;
    } else {
      a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.edit = !a_more_options_menus.find((x, i) => {
        return x.ID == UserID;
      })!.edit;
    }
    document
      .querySelector(`[tag="menu_div_${UserID}"]`)!
      .classList.toggle("is_open");

    document
      .querySelector(`[tag="editing_menu_${UserID}"]`)!
      .classList.toggle("is_open");

    var user_fields = document.querySelector(`[tag="editing_menu_${UserID}"]`)!;
    var user_fields_values = result.find((value) => {
      return value.UserID == UserID;
    })!;

    (
      user_fields!.querySelector(`[id="image_link_input"]`) as HTMLInputElement
    ).value = user_fields_values.Icon;
    (
      user_fields!.querySelector(`[id="name_input"]`) as HTMLInputElement
    ).value = user_fields_values.Name;
    (
      user_fields!.querySelector(`[id="user_id_input"]`) as HTMLInputElement
    ).value = user_fields_values.UserID;
    (
      user_fields!.querySelector(
        `[id="birthday_date_input"]`
      ) as HTMLInputElement
    ).value = user_fields_values.BirthdayDate;

    // adds onClick functionality for save_edit button of friend.
    user_fields
      .querySelector('[class="save_changes"]')!
      .addEventListener("click", function () {
        save_edit(user_fields_values);
      });
  });
}

// A function that saves all edited data into DataBase.
function save_edit(user_fields_values = { ...base_user_data }) {
  if (user_fields_values.ID != 0) {
    var user_fields = document.querySelector(
      `[tag="editing_menu_${user_fields_values.UserID}"]`
    )!;
    var update = { ...user_fields_values };
    update.ID = user_fields_values.ID;
    update.Icon = (
      user_fields.querySelector(`[id="image_link_input"]`)! as HTMLInputElement
    ).value;
    update.Name = (
      user_fields.querySelector(`[id="name_input"]`)! as HTMLInputElement
    ).value;
    update.UserID = (
      user_fields.querySelector(`[id="user_id_input"]`)! as HTMLInputElement
    ).value;
    update.BirthdayDate = (
      user_fields.querySelector(
        `[id="birthday_date_input"]`
      )! as HTMLInputElement
    ).value;

    update.notification.last_date = new Date("1980").getTime();

    errors_check = check_fields(update, user_fields);

    if (!errors_check.find((e) => e == true)) {
      chromeGetValue(save_file).then((result) => {
        UpdateData(result, update);
        update_calendar_page(getMainParent(), result);
      });
    }
    a_more_options_menus = [];
  }
}

// A function that creates each list item that contains all friend's information and UI elements with all it's classes.
function createListItem(user_object = { ...base_user_data }) {
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
                <p class="notifications_settings">
                  When do you want to start recieving notifications?<input
                  class="notif_start"
                    type="number"
                    step="1"
                    min="1"
                    max="365"
                    placeholder="1 - 365"
                  />
                </p>
                <div class="notifications_settings">
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