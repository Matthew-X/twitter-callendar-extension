const save_file = 'save_file';

let base_user_data = {
    Name: Element,
    UserID: Element,
    BirthdayDate: Element
}

//chrome.storage.sync.clear();

//chrome.storage.sync.set({ 'bitch': "chrome is a bitch" });
//chrome.storage.sync.get('bitch', function(result) { console.log(result) });

{
    chrome.storage.sync.get(save_file, function(result) {
        if (result == null) {
            chrome.storage.sync.set({ save_file: base_user_data });
            console.log("created base");
        }
        console.log(result);
    });
}

function chromeGetValue(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (items) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(items);
        });
    });
}

function getParent() {
    var arrPrimary = Array.from(document.querySelectorAll('[aria-label="Primary"]'));
    if (arrPrimary == null || arrPrimary.length == 0) return null;

    return arrPrimary.find(el => el.getAttribute('role') == 'navigation');
}

function getMainParent() {
    var arrPrimary = Array.from(document.querySelectorAll('[role="main"]'));
    if (arrPrimary == null || arrPrimary.length == 0) return null;

    return arrPrimary.find(el => el.getElementsByTagName('div')[0]);
}

function getBDBParent() {
    var arrPrimary = Array.from(document.querySelectorAll('[data-testid="UserBirthdate"]'));
    if (arrPrimary == null || arrPrimary.length == 0) return null;

    return arrPrimary.find(el => el.getElementsByTagName('span'));
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

function initBDB() {
    var BDBElement = getBDBParent();

    if (BDBElement != null) {
        setupBDB(BDBElement);
    } else {
        requestAnimationFrame(initBDB);
    }
}

function UpdateData(usersArray = [base_user_data], user_data = base_user_data) {
    console.log(usersArray);
    console.log(user_data.UserID.children[0].innerText);
    if (usersArray.length >= 0) {
        if (usersArray == 0 ||
            usersArray.find(el => el.UserID.children[0].innerText == user_data.UserID.children[0].innerText) == null ||
            usersArray.find(el => el.UserID.children[0].innerText == user_data.UserID.children[0].innerText) == 0) {
            usersArray.push(user_data);
            chrome.storage.sync.set({ save_file: usersArray });
            return console.log('Saved new data')
        } else {
            var temp = usersArray.find(el => el.UserID.children[0].innerText == user_data.UserID.children[0].innerText);
            console.log(usersArray)
            temp = user_data;
            chrome.storage.sync.set({ save_file: usersArray });
            return console.log('Data updated')
        }
    } else {
        let temp = [user_data];
        console.log(temp)
        chrome.storage.sync.set({ save_file: user_data });
        chrome.storage.sync.get(save_file, function(result) { console.log(result) });
    }
}

function setupBDB(BDBElement) {
    if (BDBElement != null || BDBElement.children > 0) {
        let user_data = base_user_data;

        const birthday_button = document.createElement("a");
        birthday_button.className = "Birthday_button";

        birthday_button.onclick = function() {
            {
                var arrPrimary = Array.from(document.querySelectorAll('[data-testid="UserBirthdate"]'));
                user_data.BirthdayDate = arrPrimary.find(el => el.getElementsByTagName('span')).cloneNode(true);
            }

            {
                var arrPrimary = Array.from(document.querySelectorAll('[data-testid="UserName"]'));
                user_data.Name = arrPrimary.find(el => el.getElementsByTagName('div')).children[0].children[0].children[0].cloneNode(true);
            }

            {
                var arrPrimary = Array.from(document.querySelectorAll('[data-testid="UserName"]'));
                user_data.UserID = arrPrimary.find(el => el.getElementsByTagName('div')).children[0].children[0].children[1].cloneNode(true);
            }

            chromeGetValue(save_file).then(result => {
                console.log(result);
                UpdateData(result, user_data);
            });
            chrome.storage.sync.get(save_file, function(result) { console.log(result) });
            console.log(user_data.UserID.children[0].innerText);
        }

        birthday_button.appendChild(BDBElement.cloneNode(true));
        console.log(birthday_button)
        BDBElement.children[0].remove();
        BDBElement.innerHTML = '';
        Array
            .from(document.querySelectorAll('[data-testid="UserProfileHeader_Items"]'))
            .find(el => el.getElementsByTagName('span'))
            .replaceChild(birthday_button, BDBElement);
    }
}

function setupCalendar(parentElement) {
    if (parentElement != null || parentElement.children > 0) {
        //let CalendarButton = parentElement.children[4].cloneNode(true);

        const calendar_button_holder = document.createElement("a");
        calendar_button_holder.className = "Calendar_button_holder";

        let CalendarButton = document.createElement("div")
        CalendarButton.className = "Calendar_button";

        const a = document.createElement("a")
        const calendar_button_img = document.createElement("img");
        calendar_button_img.src = chrome.runtime.getURL("assets/images/Google_calendar.svg");
        a.innerText = 'Calendar';

        CalendarButton.onclick = function() {
            var mainElement = getMainParent();
            if (mainElement != null) {
                calendarPage(mainElement);
            }
            calendarPage()
        }

        CalendarButton.appendChild(calendar_button_img)
        CalendarButton.appendChild(a)

        calendar_button_holder.appendChild(CalendarButton);

        parentElement.insertBefore(calendar_button_holder, parentElement.children[4]);
    } else {
        console.log("it was null")
    }
}

var active = false;

function calendarPage(mainElement) {
    if (!active) {
        if (mainElement != null) {
            console.log(mainElement)
            mainElement.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.display = "none";
            active = !active;

        } else {
            console.log(csvFile)
        }
    } else {
        if (mainElement != null) {
            mainElement.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.display = "flex";
            active = !active;
        } else {
            console.log(active)
        }
    }
}