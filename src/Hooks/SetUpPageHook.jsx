import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useRef } from "react";

const initialState = {
  loading: false,
  error: "",
  posts: null,
  file: "",
  isDragging: false,
};

function reducer(state, { payload, label }) {
  switch (label) {
    case "isLoading":
      return { ...state, loading: true, error: "" };

    case "isFetchedPosts":
      return { loading: false, error: "", posts: payload };

    case "setFile":
      return { ...state, isDragging: false, file: payload };

    case "isError":
      return { ...state, loading: false, error: payload };

    case "refetchedPosts":
      return { ...state, posts: [...payload] };

    case "newPost":
      return { ...state, posts: [...payload, ...state.posts] };
  }
}

//if we have an id, it means we are fecthing the posts by particular user

//if not we are fetching posts from everyone
export function useSetupPage(fetchFn, id = null) {
  const mainRef = useRef(null);
  const numberRef = useRef(10);

  const [{ loading, error, posts }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  //handles the fetching of old posts or replies when the user scrolls to the bottom
  const queryClient = useQueryClient();
  const {
    mutate,
    isPending,
    error: isError,
  } = useMutation({
    mutationFn: fetchFn,

    onSuccess: (data) => {
      //only increment the ref if the scroll actually returned more old posts & we were scrolling down
      if (data?.length > 0 || (data?.Posts.length > 0 && data?.number)) {
        //add the newly fetched posts to the data
        dispatch({ label: "refetchedPosts", payload: id ? data : data.Posts });

        //refetch the logged in users info
        queryClient.invalidateQueries({ queryKey: ["userinfo"] });

        //increment the ref
        numberRef.current += 10;
      }
    },
  });

  //the function we use to fetch our posts on mount
  const fetchPosts = useCallback(
    async function () {
      try {
        dispatch({ label: "isLoading" });

        const data = id ? await fetchFn({ id }) : await fetchFn();
        dispatch({ label: "isFetchedPosts", payload: id ? data : data.Posts });
      } catch (err) {
        dispatch({ label: "isError", payload: err.message });
      }
    },
    [fetchFn, id],
  );

  //fetches the 10 latests posts on mount
  useEffect(
    function () {
      fetchPosts();
    },
    [fetchPosts],
  );

  //adds a scroll event listener on mount,
  //if the user scrolls close to the last post/reply && we are not already fetching
  // fetch more using the mutation fuction we defined above
  useEffect(
    function () {
      const element = mainRef.current;

      function scrollFn() {
        if (
          element.scrollTop + element.clientHeight >=
            element.scrollHeight * 0.9 &&
          !isPending
        ) {
          id
            ? mutate({ id, number: numberRef.current })
            : mutate(numberRef.current);
        }
      }

      element.addEventListener("scroll", scrollFn);

      return () => element.removeEventListener("scroll", scrollFn);
    },
    [mutate, isPending, id],
  );

  return {
    mainRef,
    numberRef,
    dispatch,
    loadingPosts: loading,
    postsError: error,
    posts,
    isFetchingMore: isPending,
    fetcMoreError: isError,
    refetchPosts: fetchPosts,
  };
}
