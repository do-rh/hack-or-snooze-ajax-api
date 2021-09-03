"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();


}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);
$("#nav-favorites").on("click", function () {
  hidePageComponents();
  putFavoriteStoriesOnPage();
});

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $navHiddenLinks.show();
  $(".account-forms-container").hide();

}

/** When user clicks on submit button in nav bar, all components are hidden
 *  and story submit form is unhidden
 */

$("#nav-submit-stories").on("click", function () {
  hidePageComponents();
  $storySubmissionForm.show();
  $allStoriesList.show();
});

