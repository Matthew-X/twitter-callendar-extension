const save_file = "save_file";

let base_user_data = {
  Icon: "",
  Name: "",
  UserID: "",
  BirthdayDate: "",
};

//chrome.storage.sync.clear();

//chrome.storage.sync.set({ 'bitch': "chrome is a bitch" });
//chrome.storage.sync.get('bitch', function(result) { console.log(result) });

{
  chromeGetValue(save_file).then((result) => {
    if (result == null) {
      chrome.storage.sync.set({ save_file: base_user_data });
      console.log("created base");
    }
    console.log(result);
  });
}

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

function getParent() {
  var arrPrimary = Array.from(
    document.querySelectorAll('[aria-label="Primary"]')
  );
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find((el) => el.getAttribute("role") == "navigation");
}

function getMainParent() {
  var arrPrimary = Array.from(document.querySelectorAll('[role="main"]'));
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find((el) => el.getElementsByTagName("div")[0]);
}

function getBDBParent() {
  var arrPrimary = Array.from(
    document.querySelectorAll('[data-testid="UserBirthdate"]')
  );
  if (arrPrimary == null || arrPrimary.length == 0) return null;

  return arrPrimary.find((el) => el.getElementsByTagName("span"));
}

requestAnimationFrame(initCalendarButton);

function initCalendarButton() {
  var parentElement = getParent();

  if (parentElement != null) {
    setupCalendar(parentElement);
  } else {
    requestAnimationFrame(initCalendarButton);
  }
}

requestAnimationFrame(initBDB);

var oldHref = document.location.href;

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

function initBDB() {
  console.log("BDB initialized");
  var BDBElement = getBDBParent();

  if (BDBElement != null) {
    setupBDB(BDBElement);
  } else {
    requestAnimationFrame(initBDB);
  }
}

function elementFromHtml(html) {
  const template = document.createElement("template");

  template.innerHTML = html.trim();

  return template.content.firstElementChild;
}

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

function setupCalendar(parentElement) {
  if (parentElement != null || parentElement.children > 0) {
    //let CalendarButton = parentElement.children[4].cloneNode(true);

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

var active = false;

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
