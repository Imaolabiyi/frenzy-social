import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { NavLink } from "react-router-dom";

import { FaRegImages } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import toast from "react-hot-toast";

import {
  getPosts,
  getUsersInfo,
  setBackToCurrentInfo,
  updateUserInfo,
} from "../Actions/functions";
import { usernameExists } from "../Helpers/heperFunctions";

import LoadingUsersInfo from "./LoadingUsersInfo";
import { ErrorLoading } from "./Errors";
import { UIContext } from "./AppLayout";
import { Button } from "./Button";

export function UserInfo() {
  const {
    isEditingUserInfo,
    toggleEditUserInfo,
    toggleImageModal,
    isImageModal,
  } = useContext(UIContext);

  //gets the logged in user id from the local storage
  const {
    user: { id },
  } = JSON.parse(localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"));

  //fetches the users information on mount
  const {
    status,
    data: userInfo,
    refetch,
    error,
  } = useQuery({
    queryKey: ["userinfo"],
    queryFn: () => getUsersInfo(id),
  });

  function refetchBoth() {
    refetch();
    getPosts();
  }

  return (
    <>
      {status === "pending" ? <LoadingUsersInfo /> : null}

      {status === "success" && !isEditingUserInfo ? (
        <div className="animate-flash bg-sideColor px-4  py-5">
          <div className=" flex flex-col   items-center justify-between space-y-2 ">
            <ProfilePicture
              avatar={userInfo.avatar}
              toggleImageModal={toggleImageModal}
              isImageModal={isImageModal}
            />

            <UserName
              username={userInfo.username}
              toggleEditUserInfo={toggleEditUserInfo}
              isEditingUserInfo={isEditingUserInfo}
            />

            <NumberOfPosts posts={userInfo.num_posts} />
          </div>

          <div className="= flex items-center justify-evenly space-x-4 py-4 ">
            <ProfileNav page={"Profile"} />

            <ProfileNav page={"Explore"} />
          </div>

          <UserJoined date={userInfo.created_at} />
        </div>
      ) : null}

      {status === "error" ? (
        <ErrorLoading retryFn={refetchBoth} message={error?.message} />
      ) : null}

      {isEditingUserInfo && status === "success" ? (
        <EditUserInfo
          currentUsername={userInfo.username}
          currentImage={userInfo.avatar}
          isEditing={isEditingUserInfo}
          setIsEditing={toggleEditUserInfo}
        />
      ) : null}
    </>
  );
}

const ProfilePicture = memo(function ProfilePicture({
  avatar,
  toggleImageModal,
  isImageModal,
}) {
  function showFullImage(e) {
    e.stopPropagation();
    toggleImageModal(avatar);
  }

  return (
    <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full ">
      <img
        onClick={showFullImage}
        src={avatar}
        className={`h-full w-full cursor-pointer rounded-full object-cover transition-all duration-500 ${
          isImageModal ? "grayscale-[80%]" : ""
        } hover:grayscale-[80%]`}
      />
    </div>
  );
});

const UserName = memo(function UserName({ username, toggleEditUserInfo }) {
  function HandleEditClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleEditUserInfo((c) => !c);
  }

  return (
    <div className="flex items-center space-x-2 font-bold">
      <span> @{username.replaceAll('"', "")}</span>
      <FiEdit
        onClick={HandleEditClick}
        className="cursor-pointer transition-all duration-300 hover:text-orangeColor"
      />
    </div>
  );
});

const NumberOfPosts = memo(function NumberOfPosts({ posts }) {
  return (
    <p className="text-sm font-semibold">
      {posts} {posts !== 1 ? "Posts" : "Post"}
    </p>
  );
});

const ProfileNav = memo(function ProfileNav({ page }) {
  return (
    <NavLink
      to={page}
      className={
        "font-semibold transition-all duration-500 hover:text-orangeColor"
      }
    >
      {page}
    </NavLink>
  );
});

const UserJoined = memo(function UserJoined({ date }) {
  const formattedDate = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "medium",
  }).format(new Date(date));

  return <p className="text-center  text-xs">Joined {formattedDate}</p>;
});

function EditUserInfo({ setIsEditing, currentImage, currentUsername }) {
  const [avatar, setAvatar] = useState(null);

  const { register, formState, handleSubmit, reset } = useForm();
  const { errors } = formState;

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: updateUserInfo,

    onSuccess: () => {
      setAvatar(null);
      reset();
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["userinfo"] });
      toast.success("Update Successful");
    },

    onError: (errors) => {
      //if anything failed, set the values in the database back to what we had before
      setBackToCurrentInfo(currentUsername, currentImage);

      //check if the error was username already exists one
      const userExists = usernameExists(errors.message);

      toast.error(userExists ? "Username is Taken" : errors.message);
    },
  });

  function updateInfo(newInfo) {
    const { username } = newInfo;

    if (!username && !avatar) {
      setIsEditing(false);
      return;
    }

    const infoToUpload = { username, avatar };
    mutate(infoToUpload);
  }

  return (
    <div
      className={`  px-4  py-5  ${
        isPending
          ? "animate-flasInfinite bg-isSending"
          : "animate-flash bg-sideColor "
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <h1 className="font-semibold">Edit Profile</h1>
      <form
        className="flex w-full flex-col items-center space-y-4 "
        onSubmit={handleSubmit(updateInfo)}
      >
        <EditImage currentImage={currentImage} setAvatar={setAvatar} />

        <EditUsername register={register} errors={errors} />

        <Button width={"w-full"} isPending={isPending}>
          Update
        </Button>
      </form>
    </div>
  );
}

function EditImage({ setAvatar, currentImage }) {
  const memoReader = useMemo(function () {
    return new FileReader();
  }, []);

  const fileRef = useRef(null);
  const imageRef = useRef(null);

  //when we click the image it triggers the hidden file input
  function handleImageClick(e) {
    e.stopPropagation();
    fileRef.current.click();
  }

  function storeImage(e) {
    const selectedFile = e.target.files[0];
    //convert the selected file to an image and set the img element to that image
    memoReader.readAsDataURL(selectedFile);
    //add it to the state, for it to be sent
    setAvatar(selectedFile);
  }

  //adds the reader event listener on mount, removes it when it unmounts
  useEffect(
    function () {
      function fileLoaded(e) {
        // convert image file to string
        imageRef.current.src = e.target.result;
      }

      memoReader.addEventListener("load", fileLoaded, false);

      return () => memoReader.removeEventListener("load", fileLoaded);
    },
    [memoReader],
  );

  return (
    <div className="group relative flex h-[200px] w-[200px] items-center justify-center rounded-full ">
      <img
        onClick={handleImageClick}
        ref={imageRef}
        src={currentImage}
        className={`h-full w-full cursor-pointer rounded-full object-cover opacity-75 grayscale-[90%] transition-all duration-500 hover:grayscale-[100%]`}
      />

      <input
        type="file"
        accept={["image/png", "image/jpeg", "image/jpg"]}
        className="hidden"
        ref={fileRef}
        onClick={(e) => e.stopPropagation()}
        onChange={storeImage}
      />

      <FaRegImages className="pointer-events-none absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] cursor-pointer text-4xl font-semibold text-white transition-colors duration-300 group-hover:text-orangeColor" />
    </div>
  );
}

function EditUsername({ register, errors }) {
  return (
    <div className="relative rounded-sm border border-black bg-orangeColor">
      <input
        id="username"
        type="text"
        className={`peer w-full bg-orangeColor px-2 pb-0.5  pt-4 font-semibold text-white outline-none  transition-colors duration-300 ${
          errors?.username ? "focus:bg-red-600" : "focus:bg-btnHover"
        } `}
        {...register("username", {
          minLength: { value: 6, message: "at least 6 characters" },
          maxLength: {
            value: 12,
            message: "6-12 characters only",
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: "alphanumeric only",
          },
        })}
      />

      {errors?.username?.message ? (
        <p className=" absolute left-2 top-1  text-xs font-semibold tracking-wide text-white transition-all duration-300 peer-focus:top-0 peer-focus:opacity-75">
          {errors.username.message}
        </p>
      ) : null}

      {!errors?.username ? (
        <label
          htmlFor="username"
          className=" font-base absolute left-2  top-1 text-xs tracking-widest text-white transition-all duration-300 peer-focus:top-0 peer-focus:opacity-75"
        >
          new username
        </label>
      ) : null}
    </div>
  );
}
