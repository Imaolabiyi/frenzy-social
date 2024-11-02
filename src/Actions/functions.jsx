import { trimWord } from "../Helpers/heperFunctions";
import { supabase } from "../Supabase/supabase";
import Compressor from "compressorjs";

export async function logInUser(userInfo) {
  const { error } = await supabase.auth.signInWithPassword(userInfo);

  //if there was an error logging in, show it
  if (error) {
    throw new Error(error.message);
  }
}

export async function signUpUser(userInfo) {
  const { email, password, userName } = userInfo;

  const trimmedEmail = trimWord(email);
  const trimedUsername = trimWord(userName);

  //create the user with these details
  const { error: createError } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: { data: { userName: trimedUsername } },
  });

  //if there was an error signing up
  if (createError?.message) {
    throw new Error(createError.message);
  }
}

export async function logOutUser() {
  let { error } = await supabase.auth.signOut();
  if (error?.message) throw new Error(error.message);
}

//downloads or gets from db
export async function getPosts(id) {
  //fetch the posts for this particular id
  let { data: Posts, error } = await supabase
    .from("Posts")
    .select("*")
    .eq("user_id", id);

  //if there was an error handle it
  if (error?.message) {
    throw new Error(error.message);
  }

  //if the posts were fetched, store it
  return Posts;
}

export async function getUsersInfo(id) {
  let { data: UsersInfo, error } = await supabase
    .from("UsersInfo")
    .select("*")
    .eq("id", id);

  if (error?.message) {
    throw new Error(error.message);
  }

  return UsersInfo[0];
}

export async function getSinglePost(postId) {
  let { data: Posts, error } = await supabase
    .from("Posts")
    .select("*")
    .eq("id", postId);

  if (error?.message) {
    throw new Error(error.message);
  }

  return Posts[0];
}

export async function findUsers(info) {
  const { searchValue, abortSignal } = info;
  let { data: Users, error } = await supabase
    .from("UsersInfo")
    .select("*")
    .ilike("username", `%${searchValue}%`)
    .abortSignal(abortSignal.signal);

  if (error?.message) throw new Error(error.message);

  return Users;
}

export async function getUsersPosts({ id, number = 0 }) {
  let { data: Posts, error } = await supabase
    .from("Posts")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(10)
    .range(0, 9 + number);

  if (error?.message) {
    throw new Error(error.message);
  }

  return Posts;
}

export async function getAllPostsByUsers(number = 0) {
  let { data: Posts, error } = await supabase
    .from("Posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)
    .range(0, 9 + number);

  if (error?.message) {
    throw new Error(error.message);
  }

  return { Posts, number };
}

export async function getRepliesToPost({ id, number = 0 }) {
  let { data: Comments, error } = await supabase
    .from("Comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: false })
    .limit(10)
    .range(0, 9 + number);

  if (error?.message) {
    throw new Error(error.message);
  }

  return Comments;
}

//uploads or send to db
export async function uploadPost(postDetails) {
  //users info
  const { username: newUsername, image, content, user_id } = postDetails;

  const username = newUsername.replaceAll('"', "");

  let postInfo;
  let compressedBlob;
  let imageName;

  //if the user uploaded an image
  if (image) {
    //create a unique image name
    imageName = image.name.replaceAll(/[./?()]/gi, "") + Date.now();

    //compress the image, returns the compressed file
    compressedBlob = await new Promise((resolve, reject) => {
      new Compressor(image, {
        quality: 1, // Adjust the desired image quality (0.0 - 1.0)
        maxWidth: 1100, // Adjust the maximum width of the compressed image
        maxHeight: 800, // Adjust the maximum height of the compressed image
        mimeType: "image/jpeg", // Specify the output image format

        success(result) {
          resolve(result);
        },

        //if the compression failed, it returns an error that is caught in the catch block
        error(error) {
          reject(error);
        },
      });
    });

    //if compression worked, form the link to the image in supabase storage
    const imageUrl = `https://jmfwsnwrjdahhxvtvqgq.supabase.co/storage/v1/object/public/postImages/${imageName}`;

    //the post data we want to send to the database
    postInfo = { image: imageUrl, user_id, content, username };

    //send the data to the posts & images to the Table
    const [posts, images] = await Promise.all([
      supabase.from("Posts").insert(postInfo).select(),
      supabase.storage.from("postImages").upload(imageName, compressedBlob),
    ]);

    //if there was an error sending the post data to database, throw it
    if (posts?.error?.message) {
      throw new Error(posts.error.message);
    }
    //if there was an error sending the post data to database, throw it
    if (images?.error?.message) {
      throw new Error(images.error.message);
    }

    return posts.data;
  }

  //images are not compulsory to upload, so if the user didnt upload an image
  else {
    //the post data to send to the database
    postInfo = { user_id, content, username };

    //send the posts data to the table
    const { data, error } = await supabase
      .from("Posts")
      .insert(postInfo)
      .select();

    if (error?.message) {
      throw new Error(error.message);
    }

    return data;
  }
}

export async function uploadReply(commentDetails) {
  const { image, content, postId: post_id, user_id, username } = commentDetails;

  const newUsername = username.replaceAll('"', "");

  let commentInfo;
  let compressedBlob;
  let imageName;

  //if the user uploaded an image
  if (image) {
    //create a unique image name
    imageName = image.name.replaceAll(/[./?()]/gi, "") + Date.now();

    //compress the image, returns the compressed file
    compressedBlob = await new Promise((resolve, reject) => {
      new Compressor(image, {
        quality: 1, // Adjust the desired image quality (0.0 - 1.0)
        maxWidth: 1100, // Adjust the maximum width of the compressed image
        maxHeight: 800, // Adjust the maximum height of the compressed image
        mimeType: "image/jpeg", // Specify the output image format

        success(result) {
          resolve(result);
        },

        //if the compression failed, it returns an error that is caught in the catch block
        error(error) {
          reject(error);
        },
      });
    });

    //if compression worked, form the link to the image in supabase storage
    const imageUrl = `https://jmfwsnwrjdahhxvtvqgq.supabase.co/storage/v1/object/public/postImages/${imageName}`;

    //the comment data we want to send to the database
    commentInfo = {
      image: imageUrl,
      user_id,
      content,
      username: newUsername,
      post_id,
    };

    //send the comments to the table & images to the storage
    const [comments, images] = await Promise.all([
      supabase.from("Comments").insert(commentInfo).select(),
      supabase.storage.from("postImages").upload(imageName, compressedBlob),
    ]);

    //if there was an error sending the comment to database, throw it
    if (comments?.error?.message) {
      throw new Error(comments.error.message);
    }

    //if there was an error sending the image  to storage, throw it
    if (images?.error?.message) {
      throw new Error(images.error.message);
    }

    return comments.data;
  }

  //no image
  else {
    commentInfo = { user_id, content, username: newUsername, post_id };

    const { data: newComment, error } = await supabase
      .from("Comments")
      .insert(commentInfo)
      .select();

    if (error?.message) {
      throw new Error(error.message);
    }

    return newComment;
  }
}

export async function updateUserInfo(newInfo) {
  const { username, avatar: avatarFile } = newInfo;
  //gets the id  from the local storage
  const {
    user: { id },
  } = JSON.parse(localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"));

  if (avatarFile) {
    //create a unique name for the avatar
    let avatarName = avatarFile.name.replaceAll(/[./?()]/gi, "") + Date.now();

    //compress the avatarFile, returns the compressed file
    let compressedBlob = await new Promise((resolve, reject) => {
      new Compressor(avatarFile, {
        quality: 1, // Adjust the desired image quality (0.0 - 1.0)
        maxWidth: 1100, // Adjust the maximum width of the compressed image
        maxHeight: 800, // Adjust the maximum height of the compressed image
        mimeType: "image/jpeg", // Specify the output image format

        success(result) {
          resolve(result);
        },

        //if the compression failed, it returns an error that is caught in the catch block
        error(error) {
          reject(error);
        },
      });
    });

    //if compression worked, form the link to the avatar in supabase storage
    const avatarUrl = `https://jmfwsnwrjdahhxvtvqgq.supabase.co/storage/v1/object/public/Avatars/${avatarName}`;

    //if the user is also updating their username
    if (username) {
      //the updatedInfo we want to send to the usersInfo
      let usersNewInfo = {
        username: `"${trimWord(username)}"`,
        avatar: avatarUrl,
      };

      //send the data to the usersInfo & images to the Table
      const [updateResponse, avatarUploadResponse] = await Promise.all([
        await supabase.from("UsersInfo").update(usersNewInfo).eq("id", id),

        supabase.storage.from("Avatars").upload(avatarName, compressedBlob),
      ]);

      //if there was an error sending the avatar  to storage
      if (avatarUploadResponse?.error?.message) {
        throw new Error(avatarUploadResponse.error.message);
      }
      //if there was an error sending the usersinfo to database
      if (updateResponse?.error?.message) {
        throw new Error(updateResponse.error.message);
      }
    }

    //if the user is only updating their avatar
    if (!username) {
      //send the avatarlink to the usersInfo & avatar to the Table
      const [updateResponse, avatarUploadResponse] = await Promise.all([
        await supabase
          .from("UsersInfo")
          .update({ avatar: avatarUrl })
          .eq("id", id),

        supabase.storage.from("Avatars").upload(avatarName, compressedBlob),
      ]);

      //if there was an error sending the usersinfo to database
      if (updateResponse?.error?.message) {
        throw new Error(updateResponse.error.message);
      }
      //if there was an error sending the avatar  to storage
      if (avatarUploadResponse?.error?.message) {
        throw new Error(avatarUploadResponse.error.message);
      }
    }
  }

  //if the user is only updating their username
  if (!avatarFile && username) {
    const { error } = await supabase
      .from("UsersInfo")
      .update({ username: `"${trimWord(username)}"` })
      .eq("id", id);

    if (error?.message) {
      throw new Error(error.message);
    }
  }
}

//if the update failed
export async function setBackToCurrentInfo(username, avatarlink) {
  const {
    user: { id },
  } = JSON.parse(localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"));

  const { error } = await supabase
    .from("UsersInfo")
    .update({ username, avatar: avatarlink })
    .eq("id", id);

  if (error?.message) {
    throw new Error(error.message);
  }
}
