// Variable that saves key for chrome.storage to manage data in it.
const save_file = "save_file";

// Blank for item in data-base.
let base_user_data = {
  Icon: "",
  Name: "",
  UserID: "",
  BirthdayDate: "",
};

// A piece of code that creates initial database for user when user launches code for the first time.
chromeGetValue(save_file).then((result) => {
  if (result == null) {
    chrome.storage.sync.set({ save_file: base_user_data });
    console.log("created base");
  }
  console.log(result);
});

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

  return arrPrimary.find((el) => el.getElementsByTagName("span"));
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

// A function that will keep searching for a twitter's birthday date on the page and will create a (save birthday button) upon finding birthday date.
function initBDB() {
  console.log("BDB initialized");
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
      usersArray == 0 ||
      usersArray.find((el) => el.UserID == user_data.UserID) == null ||
      usersArray.find((el) => el.UserID == user_data.UserID) == 0
    ) {
      usersArray.push(user_data);
      chrome.storage.sync.set({ save_file: usersArray });
      chromeGetValue(save_file).then((result) => {});
      console.log("Saved new data");
    } else {
      var temp = usersArray.find((el) => el.UserID == user_data.UserID);
      temp = user_data;
      chrome.storage.sync.set({ save_file: usersArray });
      chromeGetValue(save_file).then((result) => {
        console.log(result);
      });
      console.log("Data updated");
    }
  } else {
    chrome.storage.sync.set({ save_file: [user_data] });
    chromeGetValue(save_file).then((result) => {});
  }
}

// A function that replaces Birthday element on friend's page with a Birthday button that upon clicking will save friend's information (Name/ID/Birthday date/Icon) into the calendar.
function setupBDB(BDBElement) {
  if (BDBElement != null || BDBElement.children > 0) {
    let user_data = base_user_data;

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
        user_data.BirthdayDate = arrPrimary.find((el) =>
          el.getElementsByTagName("span")
        ).innerText;
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
        console.log(result);
        UpdateData(result, user_data);
      });
      chrome.storage.sync.get(save_file, function (result) {
        console.log(result);
      });
      console.log(user_data.UserID);
    };

    birthday_button.appendChild(BDBElement.cloneNode(true));

    if (document.querySelectorAll('[class="Birthday_button"]').length == 0) {
      console.log(document.querySelectorAll('[class="Birthday_button"]'));
      BDBElement.children[0].remove();
      BDBElement.innerHTML = "";
      console.log(BDBElement);
      Array.from(
        document.querySelectorAll('[data-testid="UserProfileHeader_Items"]')
      )
        .find((el) => el.getElementsByTagName("span"))
        .replaceChild(birthday_button, BDBElement);
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
    a.innerText = "Calendar";

    CalendarButton.onclick = function () {
      var mainElement = getMainParent();
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
    console.log("it was null");
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
    } else {
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
    } else {
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
  mainElement
    .getElementsByTagName("div")[0]
    .append(createCalendarPage(users_db));

  var users = document.querySelectorAll('[tag="delete_friend"]');
  users.forEach((value) => {
    value.addEventListener("click", function () {
      delete_friend(value.id);
    });
  });
}

// A function that created the base of the Calendar page that contains all list items.
function createCalendarPage(array = [base_user_data]) {
  const ul = document.createElement("ul");

  array.forEach((x, i) => ul.appendChild(createListItem(x)));

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

// A function that creates each list item that contains all friend's information and UI elements with all it's classes.
function createListItem(user_object = base_user_data) {
  return elementFromHtml(
    `
      <li class="user">
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
        <a class="delete_button_holder"
          ><div class="delete_button" tag="delete_friend" id="${
            user_object.UserID
          }">
            <img class="delete_svg"
              src="${chrome.runtime.getURL("assets/images/delete_icon.svg")}"
            /></div
        ></a>
      </li>
    `
  );
}
