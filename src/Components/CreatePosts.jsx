import { memo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import toast from "react-hot-toast";

import { getUsersInfo, uploadPost } from "../Actions/functions";

import InputError from "./InputError";

export const CreatePosts = memo(function CreatePosts({
  isCreatePost,
  toggleCreatePost,
  addNewPostToPage,
  numberRef,
}) {
  const [file, setFile] = useState(null);

  //gets the id  from the local storage
  const {
    user: { id },
  } = JSON.parse(localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"));

  const { register, handleSubmit, formState, reset } = useForm();
  const { errors } = formState;

  //fetch the users personal data with their id
  const { status, data } = useQuery({
    queryKey: ["userinfo"],
    queryFn: () => getUsersInfo(id),
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: uploadPost,

    onSuccess: function (data) {
      toast.success("Post Was Sent");
      queryClient.invalidateQueries({ queryKey: ["posts", "allPosts"] });

      //remove the file
      setFile(null);

      // clear the post content
      reset();

      //add the new post to the page
      addNewPostToPage({ label: "newPost", payload: data });

      //increment the number ref in order to exclude the new post we just sent
      numberRef.current++;

      //close create post container
      toggleCreatePost(false);
    },

    onError: function (error) {
      toast.error(error.message);
    },
  });

  const username = data?.username.slice(1, data.username.length - 1);

  //when we submit the form, react-hook-form provides us with the post content since we registered it, but we manually get the file
  function submitPost(postInfo) {
    //if no image was added, uploaded the post content and userId like that
    if (!file) {
      mutate({ ...postInfo, user_id: id, username });
    } else {
      mutate({ ...postInfo, image: file, user_id: id, username });
    }
  }

  function cancelPost(e) {
    e.preventDefault();
    reset();
    toggleCreatePost(false);
  }

  return (
    <>
      {status === "success" ? (
        <PostContainer
          isCreatePost={isCreatePost}
          handleSubmit={handleSubmit}
          submitFn={submitPost}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={` flex h-full w-full flex-col text-xl font-bold   lg:hidden`}
          >
            <div className="flex basis-[5%] items-center justify-between border-b-2 px-4 py-3">
              <button onClick={cancelPost}>Cancel</button>
              <button disabled={isPending}>Post</button>
            </div>

            <PostContentArea
              register={register}
              errors={errors?.content?.message}
            />
          </div>
        </PostContainer>
      ) : null}
    </>
  );
});

function PostContainer({ children, isCreatePost, submitFn, handleSubmit }) {
  return (
    <form
      className={`animate-flash ease-in-out  ${
        isCreatePost ? "block" : "hidden"
      } absolute left-0 top-0 z-[100] m-[0] flex h-full w-full bg-primaryBgColor lg:hidden`}
      onSubmit={handleSubmit(submitFn)}
    >
      {children}
    </form>
  );
}

function PostContentArea({ register, errors }) {
  return (
    <div className="basis-[95%] px-4">
      <InputError>{errors}</InputError>
      <textarea
        placeholder="Tell your Frenzies something..."
        className="mb-4 block h-full w-full resize-none overflow-y-auto bg-transparent pt-2 text-base font-semibold text-black outline-none"
        {...register("content", {
          required: { value: true, message: "Post cannot be empty" },
          maxLength: {
            value: 300,
            message: "A Post cannot exceed 300 characters",
          },
        })}
      />
    </div>
  );
}

export default CreatePosts;
