export function trimWord(word) {
  const trimmedWord = word.toLowerCase().trim();
  return trimmedWord;
}

export function sortPostsFromLatestToOldest(array) {
  // Sort the posts array based on the 'created_at' property in descending order
  array.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return array;
}

//checks if the error is a 'username exists' one
export function usernameExists(errorMessage) {
  const userNameExists =
    errorMessage ===
    'duplicate key value violates unique constraint "UsersInfo_username_key"';

  return userNameExists;
}
