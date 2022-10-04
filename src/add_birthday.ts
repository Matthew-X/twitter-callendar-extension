var $ = require("jquery");
export { show_editing_menu };

function show_editing_menu(tag: string) {
  if ($(tag).is(":visible")) {
    $(tag).fadeOut(300);
  } else {
    $(tag).fadeIn(300);
  }
}
