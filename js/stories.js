"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

const $storySubmissionForm = $("#story-submission-form")

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <i class="far fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Get the data from the submit story form, call add story on
 * new story submission and then update DOM with new submission.
 */

function getStorySubmitForm() {
  const $author = $("#create-author").val();
  const $title = $("#create-title").val();
  const $url = $("#create-url").val();

  const formValues = {
    author: $author,
    title: $title,
    url: $url,
  };
  return formValues;
}

/** Expected to be used with an Event Listener. This function takes
 *  the values from getStorySubmitForm, puts it into a addStory to get
 *  a new Story object that is added to the front of the stories array.
 *  The function then calls putStoriesOnPage to add it to the HTML Page
*/
async function addStoryToStoryList(evt) {
  evt.preventDefault();
  let formValues = getStorySubmitForm();
  const response = await StoryList.addStory(currentUser, formValues);
  storyList.stories.unshift(response);
  //move this to .addStory
  putStoriesOnPage();
}

$storySubmissionForm.on("submit", addStoryToStoryList);

