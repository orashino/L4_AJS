const BASE_URL = 'https://typicode.com';

//ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

function makeCallbackRequest(endpoint, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${BASE_URL}${endpoint}`);

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        callback(null, data);
      } catch (err) {
        callback(err, null);
      }
    } else {
      callback(new Error(`Ошибка HTTP: ${xhr.status}`), null);
    }
  };

  xhr.onerror = function () {
    callback(new Error('Ошибка сети'), null);
  };

  xhr.send();
}

function fetchJsonPromise(endpoint) {
  return fetch(`${BASE_URL}${endpoint}`).then((response) => {
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    return response.json();
  });
}

async function fetchJsonAsync(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Ошибка HTTP: ${response.status}`);
  }
  return await response.json();
}

function sortPostsByTitleLengthDesc(posts) {
  return [...posts].sort((a, b) => b.title.length - a.title.length);
}

function sortCommentsByAuthorName(comments) {
  return [...comments].sort((a, b) => a.name.localeCompare(b.name));
}

function pickUserFields(users) {
  return users.map(({ id, name, username, email, phone }) => ({
    id,
    name,
    username,
    email,
    phone,
  }));
}

function filterIncompleteTodos(todos) {
  return todos.filter((todo) => !todo.completed);
}

//ПУНКТ A: КОЛЛБЭКИ

function getSortedPostsCallback(callback) {
  makeCallbackRequest('/posts', (err, posts) => {
    if (err) return callback(err, null);
    callback(null, sortPostsByTitleLengthDesc(posts));
  });
}

function getSortedCommentsCallback(callback) {
  makeCallbackRequest('/comments', (err, comments) => {
    if (err) return callback(err, null);
    callback(null, sortCommentsByAuthorName(comments));
  });
}

//ПУНКТ B: ПРОМИСЫ

function getFilteredUsersPromise() {
  return fetchJsonPromise('/users').then(pickUserFields);
}

function getIncompleteTodosPromise() {
  return fetchJsonPromise('/todos').then(filterIncompleteTodos);
}

//ПУНКТ C: ASYNC / AWAIT

async function getSortedPostsAsync() {
  const posts = await fetchJsonAsync('/posts');
  return sortPostsByTitleLengthDesc(posts);
}

async function getSortedCommentsAsync() {
  const comments = await fetchJsonAsync('/comments');
  return sortCommentsByAuthorName(comments);
}

async function getFilteredUsersAsync() {
  const users = await fetchJsonAsync('/users');
  return pickUserFields(users);
}

async function getIncompleteTodosAsync() {
  const todos = await fetchJsonAsync('/todos');
  return filterIncompleteTodos(todos);
}

//ЗАПУСК И ПРОВЕРКА

getSortedPostsCallback((err, data) => {
  if (err) console.error('Ошибка Posts (Callback):', err);
  else console.log('1. Posts (Callback):', data.slice(0, 2));
});

getSortedCommentsCallback((err, data) => {
  if (err) console.error('Ошибка Comments (Callback):', err);
  else console.log('2. Comments (Callback):', data.slice(0, 2));
});

getFilteredUsersPromise()
  .then((data) => console.log('3. Users (Promise):', data.slice(0, 2)))
  .catch((err) => console.error('Ошибка Users (Promise):', err));

getIncompleteTodosPromise()
  .then((data) => console.log('4. Todos (Promise):', data.slice(0, 2)))
  .catch((err) => console.error('Ошибка Todos (Promise):', err));

async function runAllAsync() {
  try {
    const [posts, comments, users, todos] = await Promise.all([
      getSortedPostsAsync(),
      getSortedCommentsAsync(),
      getFilteredUsersAsync(),
      getIncompleteTodosAsync(),
    ]);

    console.log('5. Posts (Async):', posts.slice(0, 2));
    console.log('6. Comments (Async):', comments.slice(0, 2));
    console.log('7. Users (Async):', users.slice(0, 2));
    console.log('8. Todos (Async):', todos.slice(0, 2));
  } catch (error) {
    console.error('Ошибка в блоке Async/Await:', error);
  }
}

runAllAsync();
