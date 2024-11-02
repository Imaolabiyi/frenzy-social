import { useSetupPage } from "../Hooks/SetUpPageHook";

import { getAllPostsByUsers } from "../Actions/functions";

import LoadingPosts from "../Components/LoadingPosts";
import { ErrorLoading } from "../Components/Errors";
import SendPost from "../Components/SendPost";
import { Post } from "../Components/Post";
import Main from "../Components/Main";

function ExplorePage() {
  const {
    mainRef,
    numberRef,
    loadingPosts,
    postsError,
    posts,
    dispatch: addLatestPostToStack,
    isFetchingMore,
    refetchPosts,
  } = useSetupPage(getAllPostsByUsers);

  return (
    <Main
      mainRef={mainRef}
      numberRef={numberRef}
      addLatestPostToStack={addLatestPostToStack}
    >
      {loadingPosts ? <LoadingPosts numOfLoaders={4} /> : null}

      {posts ? (
        <>
          <div className="lg:mb-3">
            <SendPost
              addPostOrReplyToStack={addLatestPostToStack}
              numberRef={numberRef}
            />
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

      {postsError ? (
        <ErrorLoading retryFn={refetchPosts} message={postsError} />
      ) : null}
    </Main>
  );
}

export default ExplorePage;
