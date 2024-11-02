import { useSetupPage } from "../Hooks/SetUpPageHook";

import { getUsersInfo, getUsersPosts } from "../Actions/functions";

import LoadingPosts from "../Components/LoadingPosts";
import { ErrorLoading } from "../Components/Errors";
import SendPost from "../Components/SendPost";
import { Post } from "../Components/Post";
import Main from "../Components/Main";
import { useQuery } from "@tanstack/react-query";
import { memo, useContext } from "react";
import { UIContext } from "../Components/AppLayout";

function ProfilePage() {
  const {
    user: { id },
  } = JSON.parse(localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"));

  const {
    mainRef,
    numberRef,
    loadingPosts,
    postsError,
    posts,
    dispatch: addLatestPostToStack,
    isFetchingMore,
    refetchPosts,
  } = useSetupPage(getUsersPosts, id);

  //fetch the users info on mount
  const {
    status: userInfoStatus,
    data: usersInfo,
    refetch: refetchUser,
    isError: userHasError,
    error: userError,
  } = useQuery({
    queryKey: ["userinfo"],
    queryFn: () => getUsersInfo(id),
  });

  function refetchBoth() {
    refetchPosts();
    refetchUser();
  }

  return (
    <Main
      mainRef={mainRef}
      numberRef={numberRef}
      addLatestPostToStack={addLatestPostToStack}
    >
      {(loadingPosts || userInfoStatus === "pending") &&
      !userError &&
      !postsError ? (
        <LoadingPosts />
      ) : null}

      {posts && userInfoStatus === "success" && !postsError ? (
        <>
          <div className="mb-3">
            <div className="hidden lg:block">
              <SendPost
                addPostOrReplyToStack={addLatestPostToStack}
                numberRef={numberRef}
              />
            </div>

            <div className="lg:hidden">
              <UsersInfo info={usersInfo} numberOfPosts={posts.length} />
            </div>
          </div>

          <div className="relative space-y-3">
            {posts.map((post, i) => (
              <Post key={i} info={post} />
            ))}

            {isFetchingMore ? (
              <p className="absolute bottom-2 left-1/2 z-50 translate-x-[-50%] animate-flasInfinite rounded-full bg-black px-2 py-1 text-xs text-white  ">
                Loading More Posts
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      {postsError || userHasError ? (
        <ErrorLoading
          retryFn={refetchBoth}
          message={postsError || userError.message}
        />
      ) : null}
    </Main>
  );
}

function UsersInfo({ info, numberOfPosts }) {
  const { avatar, created_at } = info;

  const username = info.username.replaceAll('"', "");
  const formatNumber = Intl.DateTimeFormat(navigator.language, {
    dateStyle: "medium",
  }).format(new Date(created_at));

  return (
    <div className="relative w-full bg-orangeColor py-2">
      <div className=" flex flex-col   items-center justify-between space-y-6 py-5">
        <ProfilePicture avatar={avatar} />

        <UserName username={username} />

        <p className="text-sm font-semibold">
          {numberOfPosts} {numberOfPosts !== 1 ? "Posts" : "Post"}
        </p>

        <p className="text-center text-xs">Joined {formatNumber}</p>
      </div>
    </div>
  );
}

const ProfilePicture = memo(function ProfilePicture({ avatar }) {
  const { toggleImageModal, isImageModal } = useContext(UIContext);

  function showImage(e) {
    e.stopPropagation();
    toggleImageModal(avatar);
  }

  return (
    <div className="flex h-1/2 w-[200px] items-center justify-center rounded-full ">
      <img
        onClick={showImage}
        src={avatar}
        className={`aspect-square h-full  w-full object-cover ${
          isImageModal ? "grayscale-[100%]" : ""
        } cursor-pointer rounded-full object-cover transition-all duration-500  hover:grayscale-[100%]`}
      />
    </div>
  );
});

const UserName = memo(function UserName({ username }) {
  return <p className="font-bold">@{username}</p>;
});

export default ProfilePage;
