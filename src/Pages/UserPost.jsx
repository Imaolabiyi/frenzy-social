import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useSetupPage } from "../Hooks/SetUpPageHook";

import { getRepliesToPost, getSinglePost } from "../Actions/functions";

import LoadingPosts from "../Components/LoadingPosts";
import { ErrorLoading } from "../Components/Errors";
import SendPost from "../Components/SendPost";
import { Post } from "../Components/Post";
import Main from "../Components/Main";

function UserPost() {
  const { postId } = useParams();

  const {
    mainRef,
    numberRef,
    isFetchingMore,
    loadingPosts: loadingReplies,
    postsError: replyError,
    posts: replies,
    refetchPosts: refetchReplies,
    dispatch: AddLatestReplyToStack,
  } = useSetupPage(getRepliesToPost, postId);

  //fetches the post we clicked on mount
  const {
    status,
    error: errorFetchingPost,
    data,
    refetch: refetchClickedPost,
  } = useQuery({
    queryKey: ["clickedPost"],
    queryFn: () => getSinglePost(postId),
    refetchOnWindowFocus: false,
  });

  return (
    <Main mainRef={mainRef}>
      {status === "pending" ? <LoadingPosts numOfLoaders={1} /> : null}

      {status === "success" ? (
        <div className="space-y-2">
          <Post info={data} isPostPage={true} replies={data.num_comments} />

          <SendPost
            addPostOrReplyToStack={AddLatestReplyToStack}
            isPostPage={true}
            numberRef={numberRef}
          />

          <Link
            className="block text-right text-sm font-semibold underline lg:text-xs"
            to={"/explore"}
          >
            Return
          </Link>

          <div className="relative space-y-3">
            {!loadingReplies && replies?.length ? (
              <>
                {replies.map((reply, i) => (
                  <Post key={i} info={reply} isPostPage={true} />
                ))}

                {isFetchingMore ? (
                  <p className="absolute bottom-2 left-1/2 z-50 translate-x-[-50%] animate-flasInfinite rounded-full bg-black px-2 py-1 text-xs text-white  ">
                    Loading Comments
                  </p>
                ) : null}
              </>
            ) : null}

            {loadingReplies ? (
              <p className="animate-flasInfinite rounded-full bg-black px-2 py-1 text-center text-xs text-white  ">
                Loading Comments
              </p>
            ) : null}

            {!loadingReplies && !replies?.length ? (
              <div className="relative space-y-3">
                <p className="text-center text-xs">No Comments Yet</p>
              </div>
            ) : null}

            {replyError ? (
              <ErrorLoading retryFn={refetchReplies} message={replyError} />
            ) : null}
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <ErrorLoading
          message={errorFetchingPost.message}
          retryFn={refetchClickedPost}
        />
      ) : null}
    </Main>
  );
}

export default UserPost;
