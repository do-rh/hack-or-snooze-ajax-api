"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    let tmpURL = new URL(this.url);
    return tmpURL.hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  //doesn't need to be static. update other callback
  static async addStory(user, newStory) {
    let postURL = BASE_URL + '/stories';
    let postSubmission = {
      token: user.loginToken,
      story: newStory
    };
    // console.log(postSubmission);
    const response = await axios.post(postURL, postSubmission);
    const structuredStory = new Story(response.data.story);
    //console.log("newStory: ", structuredStory);
    return structuredStory;
  }
}

//axios(post, url, data( = {}));

// {title: "Test", author: "Me", url: "http://meow.com"});
/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */
  //retrieved by window.localStorage
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;
      console.log("userObject:", user);

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavoriteStory(evt) {
    const $storyId = $(evt.target).closest("li").attr("id");
    // console.log("$storyId:", $storyId);
    // console.log("username:", currentUser.username);
    // console.log("getLongPart:", `${BASE_URL}/users/${currentUser.username}/favorites/${$storyId}`);
    // console.log("token:", {"token": currentUser.loginToken} );
    const response = await axios.post(`${BASE_URL}/users/${currentUser.username}/favorites/${$storyId}`, { "token": currentUser.loginToken });
    console.log("response", response);
    const favoritesList = response.data.user.favorites;
    return favoritesList;
  }

  // async getFavoritesList() {
  //   const favoritesList = currentUser.favorites;
  //   return favoritesList;
  // }

  async getUserFavoriteStories() {
    // currentUser = await axios.get(`${BASE_URL}/users/${currentUser.username}`, { "token": currentUser.loginToken });
    // return currentUser;
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}`,
      method: "GET",
      params: { "token": currentUser.loginToken },
    });
    console.log("favorites list from response: ", response.data.user.favorites);
    this.favorites = response.data.user.favorites.map(story => new Story(story));
    console.log("this favorites: ", this.favorites);
  }


  /**Loop through favoritesList array, create new list item for each story,
   * populate into html.
   */
  //modles.js should just be about making classes, no jquery/dom updates


  // async addFavoriteStory(story) {
  // paired with an eventlistener - COMPLETE
  // takes in a story - COMPLETE
  // for userFavorites, we need user and the story id - COMPLETE
  // returns userObject with favorites array within - COMPLETE
  // posting to API that takes in story instance and adds to favorite array - COMPLETE
  // somewhere add favorite story to DOM (HTML section)
  // change the class to this => <i class="fas fa-star"></i>
  // }

  // async removeFavoriteStory(story) {
  // takes in a story
  // posting to API that the story instance needs to be removed from the array;
  // change the class back to <i class="far fa-star"></i>
  // }

  // need to create two eventlisteners at some point somewhere
  // create an if statement to see if the item is already a favorite, then it'll run
  // the unfavorite function and vice versa

  // update favoritesList() {
  // empty favoritesList section
  // loop through favoritesList and add a list item to the DOM
  // }
}
