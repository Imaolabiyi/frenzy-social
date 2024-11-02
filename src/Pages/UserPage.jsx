import { memo, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { useSetupPage } from "../Hooks/SetUpPageHook";

import { getUsersInfo, getUsersPosts } from "../Actions/functions";

import { IoChevronBack } from "react-icons/io5";

import LoadingPosts from "../Components/LoadingPosts";
import { UIContext } from "../Components/AppLayout";
import { ErrorLoading } from "../Components/Errors";
import { Post } from "../Components/Post";
import Main from "../Components/Main";

function UserPage() {
  //get the userId from the params
  const { userId } = useParams();

  const { mainRef, loadingPosts, postsError, posts, isFetchingMore } =
    useSetupPage(getUsersPosts, userId);

  //fetch the users info on mount
  const {
    isLoading: userIsLoading,
    data: userData,
    refetch: refetchUser,
    isError: userHasError,
    isFetched: userIsFetched,
    error: userError,
  } = useQuery({
    queryKey: ["externalUsersInfo"],
    queryFn: () => getUsersInfo(userId),
  });

  //anytime the params changes, we refetch the data
  //this is caused anytime the user clicks the found accounts in the search bar dropdown
  useEffect(
    function () {
      refetchUser();
    },
    [userId, refetchUser],
  );

  //if both of them failed, retch both of them at the same time
  function refetchAll() {
    refetchUser();
  }

  return (
    <Main mainRef={mainRef}>
      {/**one of them is fetching or loading and both have no errors */}
      {userIsLoading || loadingPosts ? <LoadingPosts /> : null}

      {/**data fetched from both and no errors */}
      {userIsFetched && posts && !userError ? (
        <div className="relative space-y-3">
          <UsersInfo info={userData} numberOfPosts={posts.length} />

          <UsersPosts posts={posts} />

          {isFetchingMore ? (
            <p className="absolute bottom-2 left-1/2 z-50 translate-x-[-50%] animate-flasInfinite rounded-full bg-black px-2 py-1 text-xs text-white  ">
              Loading More Posts
            </p>
          ) : null}
        </div>
      ) : null}

      {/**if only one of them failed, still refetch all */}
      {userHasError || postsError ? (
        <ErrorLoading
          retryFn={refetchAll}
          message={postsError?.message || userError?.message}
        />
      ) : null}
    </Main>
  );
}

export default UserPage;

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

      <Link
        to={"/explore"}
        className="absolute left-5 top-5 text-base font-bold transition-all duration-300 hover:text-white"
      >
        <IoChevronBack className="text-2xl " />
      </Link>
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

const UsersPosts = memo(function UsersPosts({ posts }) {
  return (
    <>
      {posts.map((post, i) => (
        <Post key={i} info={post} isUserPage={true} />
      ))}
    </>
  );
});
