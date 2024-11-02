import { memo, useEffect, useState } from "react";
import Main from "../Components/Main";
import { findUsers } from "../Actions/functions";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function Search() {
  const [searchValue, setSearchValue] = useState("");
  return (
    <Main>
      <div className="flex h-full flex-col space-y-4">
        <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} />

        <SearchResults searchValue={searchValue} />
      </div>
    </Main>
  );
}

export default Search;

const SearchBar = memo(function SearchBar({ searchValue, setSearchValue }) {
  return (
    <div className="relative flex w-full items-center border-2 border-black bg-orangeColor  font-semibold text-primaryBgColor lg:rounded">
      <input
        className="input-style peer order-2 w-full rounded-none border-none bg-orangeColor transition-all duration-500 focus:bg-btnHover focus:text-primaryBgColor md:py-4 lg:p-2 "
        placeholder="username"
        onChange={(e) => setSearchValue(e.target.value)}
        value={searchValue}
      />
      <span className="order-1 h-full cursor-default border-r-2 border-black bg-orangeColor  p-2 font-bold transition-all duration-500 peer-focus:bg-btnHover peer-focus:text-primaryBgColor md:py-4 lg:p-2">
        @
      </span>
    </div>
  );
});

const SearchResults = memo(function SearchResults({ searchValue }) {
  //when the searchbarvalue changes refetch the users
  const { mutate, isPending, isSuccess, data } = useMutation({
    mutationFn: findUsers,

    onError: (err) => {
      if (
        err.message === `AbortError: The user aborted a request.` ||
        err.message === `AbortError: signal is aborted without reason` ||
        err.message === `AbortError: Fetch is aborted` ||
        err.message === "AbortError: The operation was aborted. "
      )
        return;

      toast.error(err.message);
    },
  });

  //fetch users when the value in the searchbar is at least 3
  useEffect(
    function () {
      const abortSignal = new AbortController();

      if (searchValue.length > 2) {
        mutate({ searchValue, abortSignal });
      }

      return () => abortSignal.abort();
    },
    [searchValue, mutate],
  );

  return (
    <div className="overflow-auto">
      {!data?.length && isSuccess ? (
        <p className="flex h-20 items-center justify-center text-center font-semibold text-black">
          No users found
        </p>
      ) : null}

      {data?.length && isSuccess
        ? data.map((user, i) => <FoundUser user={user} key={i} />)
        : null}

      {isPending ? (
        <p className="flex h-20 items-center justify-center text-center font-semibold text-black">
          Searching
        </p>
      ) : null}
    </div>
  );
});

function FoundUser({ user }) {
  const { avatar, num_posts } = user;
  const username = user.username.replaceAll('"', "");
  return (
    <Link
      to={`/${user.id}`}
      className="relative flex h-32 w-full flex-shrink-0 flex-grow-0 items-center space-x-4 rounded-sm bg-sideColor  p-4 font-semibold text-black transition-all duration-500  hover:bg-orangeColor "
    >
      <div className="h-full">
        <img
          src={avatar}
          className="aspect-square h-full rounded-full object-cover"
        />
      </div>
      <div>
        <p> @{username}</p>
        <p className="text-xs">{num_posts} Posts</p>
      </div>
    </Link>
  );
}
