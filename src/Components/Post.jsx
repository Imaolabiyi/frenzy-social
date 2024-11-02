import { useQuery } from "@tanstack/react-query";
import { memo, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { LiaComments } from "react-icons/lia";

import DotLoader from "./DotLoader";
import { UIContext } from "./AppLayout";

import { getUsersInfo } from "../Actions/functions";

export const Post = memo(function Post({ info, isPostPage, isUserPage }) {
  const {
    user_id: userId,
    created_at,
    content,
    image,
    id: postId,
    num_comments: comments,
  } = info;

  //we trim the username because it is shipped with quotes "username"
  const username = info.username.replaceAll('"', "");

  const navigate = useNavigate();

  function goToPostPage() {
    if (isPostPage) return;
    navigate(`/post/${postId}`);
  }

  return (
    <article
      onClick={goToPostPage}
      className={`relative bg-sideColor transition-all duration-300 lg:m-0  ${
        !isPostPage ? "cursor-pointer hover:bg-orangeLight" : null
      } `}
    >
      <PostHeader
        userId={userId}
        username={username}
        created_at={created_at}
        isUserPage={isUserPage}
      />

      <PostContent
        content={content}
        image={image}
        isPostPage={isPostPage}
        postId={postId}
      />

      {image ? <PostImage image={image} /> : null}

      {comments >= 0 ? <PostActivity noOfComments={comments} /> : null}
    </article>
  );
});

function PostHeader({ created_at, username, userId, isUserPage }) {
  const [isHovering, setIsHovering] = useState(false);

  //get the id of the user thats logged in
  const {
    user: { id: loggedId },
  } = JSON.parse(localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"));

  //if the userId of the post is the same as the logged in user, then the post is for the user, so replace username w 'You'
  const postUsername = loggedId === userId ? "You" : username;

  return (
    <h2 className=" flex items-center justify-between rounded-t-lg border-b border-primaryBgColor  px-2 py-1 font-semibold text-black">
      {/*if the post being rendered is not by the logged user and the logged in user is not on the userPage route (this means the posts being rendered is from the explore or timeline page) */}

      {loggedId !== userId && !isUserPage ? (
        <Link
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          to={`/${userId}`}
          className="group relative pr-1 font-bold transition-all duration-500 hover:text-orangeColor"
        >
          @{postUsername}
          {isHovering ? <HoverUserNameModal userId={userId} /> : null}
        </Link>
      ) : (
        <span className="font-bold">@{postUsername}</span>
      )}

      <TimeOfPost time={created_at} />
    </h2>
  );
}

function HoverUserNameModal({ userId }) {
  //get the users info
  const { isFetching, error, data } = useQuery({
    queryKey: ["externalUsersInfo"],
    queryFn: () => getUsersInfo(userId),
  });

  return (
    <>
      <div className="absolute left-full top-0 hidden h-24 min-w-52 max-w-60 animate-flash rounded-sm bg-lightBlack transition-all duration-300 hover:block hover:bg-black hover:shadow hover:shadow-black  lg:group-hover:block">
        {isFetching ? <DotLoader /> : null}

        {data && !isFetching ? (
          <div className="flex h-full w-full space-x-1 p-2 ">
            <section className="h-full rounded-full">
              <img
                src={data.avatar}
                className="aspect-square h-full rounded-full object-cover"
              />
            </section>

            <section>
              <p className=" text-xs tracking-wide text-white">
                @{data.username.replaceAll('"', "")}
              </p>

              <p className="text-xs font-normal tracking-wide text-white">
                {data.num_posts} {data.num_posts !== 1 ? "Posts" : "Post"}
              </p>
            </section>
          </div>
        ) : null}

        {error || null}
      </div>
    </>
  );
}

function TimeOfPost({ time }) {
  const newTime = new Date(time);
  const formattedDate = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "short",
    timeStyle: "short",
    hourCycle: "h12",
  }).format(newTime);

  return (
    <span className="text-xs font-medium  underline">{formattedDate}</span>
  );
}

function PostContent({ content, image }) {
  return (
    <p
      className={`min-h-10 px-2 transition-colors  duration-300 ${
        image ? "pb-3 pt-4" : "py-5"
      }  font-normal  text-black `}
    >
      {content}
    </p>
  );
}

const PostImage = memo(function PostImage({ image }) {
  const { toggleImageModal, isImageModal } = useContext(UIContext);

  function showFullImage(e) {
    e.stopPropagation();
    toggleImageModal(image);
  }
  return (
    <>
      <div className={` flex max-h-60 w-full justify-center px-3 pb-2 `}>
        <img
          onClick={showFullImage}
          className={`w-full cursor-pointer object-cover ${
            isImageModal ? "grayscale-[100%]" : ""
          } transition-all duration-300  hover:scale-[1.01]`}
          src={image}
        />
      </div>
    </>
  );
});

function PostActivity({ noOfComments }) {
  //get the total number of comments
  return (
    <div className="flex items-center justify-end space-x-4 px-3 py-1.5">
      <p className="flex items-center text-sm">
        <span>{noOfComments}</span>&nbsp;
        <LiaComments />
      </p>
    </div>
  );
}
