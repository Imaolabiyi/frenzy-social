import {
  memo,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getUsersInfo, uploadPost, uploadReply } from "../Actions/functions";

import { FaRegImages } from "react-icons/fa6";
import toast from "react-hot-toast";

import LoadingPosts from "./LoadingPosts";
import { UIContext } from "./AppLayout";
import { ErrorLoading } from "./Errors";

const sendLabel = "Talk to your frenzies..";
const replyLabel = "Reply to Post...";

const initialState = {
  isDragging: false,
  file: null,
  error: "",
  chars: 0,
};

function Reducer(state, { label, payload }) {
  switch (label) {
    case "isDragging":
      return { ...state, isDragging: true };

    case "notDragging":
      return { ...state, isDragging: false };

    case "setFile":
      return { ...state, isDragging: false, file: payload };

    case "isError":
      return { ...state, error: payload };

    case "chars":
      return { ...state, chars: payload };

    case "clearFile":
      return { ...state, file: null };

    case "reset":
      return initialState;
  }
}

const SendPost = memo(function SendPost({
  addPostOrReplyToStack,
  numberRef,
  isPostPage,
}) {
  const [{ isDragging, file, error: postError, chars }, dispatch] = useReducer(
    Reducer,
    initialState,
  );

  const contentRef = useRef(null);
  const imgRef = useRef(null);

  //get id of the logged in user
  const {
    user: { id },
  } = JSON.parse(localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"));

  //if there is a postId, we are commenting && not sending a post
  const { postId } = useParams();
  const label = postId ? replyLabel : sendLabel;

  const reader = useMemo(function () {
    return new FileReader();
  }, []);

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: postId ? uploadReply : uploadPost,

    onSuccess: function (data) {
      toast.success(`${postId ? "Reply" : "Post"} Was Sent`);

      //refetch the clicked post to show new comments
      queryClient.invalidateQueries({ queryKey: ["clickedPost"] });

      //refect the users info to update number of posts
      queryClient.invalidateQueries({ queryKey: ["userinfo"] });

      //clear the  content
      contentRef.current.textContent = "";

      dispatch({ label: "reset" });

      //add the new post or reply to the page
      addPostOrReplyToStack({ label: "newPost", payload: data });

      //increment the number ref in order to exclude the new post we just sent
      numberRef.current++;
    },

    onError: function (error) {
      toast.error(error.message);
    },
  });

  //fetch the logged in users information on mount or use already fetched info
  const {
    data,
    status,
    error: userInfoError,
    refetch,
  } = useQuery({
    queryKey: ["userinfo"],
    queryFn: () => getUsersInfo(id),
  });

  function handleDragOver() {
    dispatch({ label: "isDragging" });
  }

  function hanldeDragLeave() {
    dispatch({ label: "notDragging" });
  }

  function handleDrop(e) {
    const selectedFile = e.dataTransfer.files[0];
    reader.readAsDataURL(selectedFile);

    dispatch({ label: "setFile", payload: selectedFile });
  }

  function SubmitPost() {
    if (chars > 300 || !chars) {
      dispatch({
        label: "isError",
        payload: chars > 300 ? "Post is too long" : "Post cannot be empty",
      });
      return;
    }

    mutate({
      image: file,
      content: contentRef.current.textContent,
      postId,
      user_id: id,
      username: data?.username,
    });
  }

  //add the reader listener event for converting files
  useEffect(
    function () {
      function convertFileToImage(e) {
        imgRef.current.src = e.target.result;
      }

      reader.addEventListener("load", convertFileToImage);

      return () => reader.removeEventListener("load", convertFileToImage);
    },
    [reader, imgRef],
  );

  //prevents default behaviour for drag and drop
  useEffect(function () {
    function fns(e) {
      e = e || event;
      e.preventDefault();
    }

    window.addEventListener("dragover", fns, false);

    window.addEventListener("drop", fns, false);

    return () => {
      window.removeEventListener("dragover", fns);
      window.removeEventListener("drop", fns);
    };
  }, []);

  //this does not render until we have fetched information about the logged in user
  return (
    <>
      {status === "pending" ? <LoadingPosts numOfLoaders={1} /> : null}

      {status === "success" ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={hanldeDragLeave}
          onDrop={handleDrop}
          className={`relative  ${isPostPage ? "block" : "hidden"} w-full ${
            isDragging || isPending ? "bg-orangeLight" : "bg-sideColor"
          } ${
            isPending && "animate-flasInfinite"
          } space-y-2 border-none  px-4 py-4 transition-colors duration-300 lg:block`}
        >
          <Label error={postError} label={label} chars={chars} />

          <TextArea dispatch={dispatch} contentRef={contentRef} />

          {file ? <ImageArea imgRef={imgRef} dispatch={dispatch} /> : null}

          <div className="flex items-center justify-between pt-2">
            <AddImageBtn dispatch={dispatch} imgRef={imgRef} reader={reader} />

            <div className="flex items-center space-x-2">
              <CharsCount chars={chars} />
              <SendPostBtn submitFn={SubmitPost} isPending={isPending} />
            </div>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <ErrorLoading retryFn={refetch} message={userInfoError?.message} />
      ) : null}
    </>
  );
});

const Label = memo(function Label({ chars, label, error }) {
  return (
    <>
      {(!chars || chars > 300) && error ? (
        <p className="text-xs text-isError">{error}</p>
      ) : (
        <p className="text-xs text-black">{label}</p>
      )}
    </>
  );
});

const TextArea = memo(function TextArea({ contentRef, dispatch }) {
  // Handle paste event to maintain line breaks
  function handlePaste(event) {
    event.preventDefault();
    let text = (event.originalEvent || event).clipboardData.getData(
      "text/plain",
    );

    contentRef.current.textContent += text;
  }

  //when a key is pressed update our character count
  function onKeyPress() {
    dispatch({
      label: "chars",
      payload: contentRef.current.textContent.length,
    });
  }

  return (
    <div
      onKeyUp={onKeyPress}
      ref={contentRef}
      contentEditable={true}
      onPaste={handlePaste}
      className="block max-h-60  w-full overflow-y-auto whitespace-break-spaces bg-transparent outline-none"
    ></div>
  );
});

const ImageArea = memo(function ImageArea({ imgRef, dispatch }) {
  const { toggleImageModal } = useContext(UIContext);

  function toggleModal(e) {
    e.stopPropagation();
    toggleImageModal(e.target.src);
  }

  function removeImage() {
    dispatch({ label: "clearFile" });
  }

  return (
    <div className="relative flex max-h-60 w-full">
      <img
        ref={imgRef}
        src=""
        onClick={toggleModal}
        className="w-full object-cover"
      />

      <span
        className="absolute right-1 top-1 cursor-pointer rounded-full bg-orangeLight p-0.5 px-2 text-center text-sm font-semibold text-white transition-colors duration-300 hover:text-black"
        onClick={removeImage}
      >
        X
      </span>
    </div>
  );
});

const SendPostBtn = memo(function SendPostBtn({ submitFn, isPending }) {
  const { postId } = useParams();
  return (
    <button
      disabled={isPending}
      className="cursor-pointer text-base font-semibold transition-colors duration-300 hover:text-orangeColor disabled:cursor-wait"
      onClick={submitFn}
    >
      {postId ? "Reply" : "Post"}
    </button>
  );
});

const AddImageBtn = memo(function AddImageBtn({ dispatch, reader }) {
  const fileRef = useRef(null);

  function triggerFile(e) {
    e.preventDefault();
    fileRef.current.click();
  }

  function storeSelectedFile(e) {
    const selectedFile = e.target.files[0];
    reader.readAsDataURL(selectedFile);
    dispatch({ label: "setFile", payload: selectedFile });
  }

  return (
    <>
      <button
        className="transition-colors duration-300 hover:text-orangeColor"
        onClick={triggerFile}
      >
        <FaRegImages className="text-xl" />
      </button>

      <input
        type="file"
        className="hidden"
        accept={["image/png", "image/jpeg", "image/jpg"]}
        onChange={storeSelectedFile}
        ref={fileRef}
      />
    </>
  );
});

function CharsCount({ chars }) {
  return (
    <span className={`text-right text-xs ${chars > 300 ? "text-isError" : ""}`}>
      {chars}/300
    </span>
  );
}

export default SendPost;
