export { base_user_data, user_data, chromeGetValue, messages, save_file };

// Variable that saves key for chrome.storage to manage data in it.
const save_file = "save_file";

const messages = {
  notificationsUpdate: "notificationsUpdate",
};

const settings_base = {
  notification: true,
  initial_start: 10,
  once: false,
  daily: true,
};
type user_data = {
  ID: number;
  Icon: string;
  Name: string;
  UserID: string;
  BirthdayDate: string;
  settings: typeof settings_base;
  notification: {
    last_date: number;
  };
};
// Blank for item in data-base.
const base_user_data: user_data = {
  ID: 0,
  Icon: "",
  Name: "",
  UserID: "",
  BirthdayDate: "",
  settings: settings_base,
  notification: {
    last_date: new Date("1980").getTime(),
  },
};

// A function that retrieves data from chrome.storage.
function chromeGetValue(key: string) {
  return new Promise<user_data[]>((resolve, reject) => {
    chrome.storage.sync.get([key], (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items[key]);
    });
  })!;
}
