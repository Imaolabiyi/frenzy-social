import { memo, useContext } from "react";
import { NavLink } from "react-router-dom";

import { CiCompass1 } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";
import { CiHome } from "react-icons/ci";
import { GoPlus } from "react-icons/go";

import { UIContext } from "./AppLayout";

const BottomMobileNav = memo(function BottomMobileNav() {
  return (
    <div className="flex w-full  basis-[5%] items-center justify-between bg-sideColor px-4 py-5 lg:hidden">
      <NavbarLink path={"Profile"}>
        <CiHome />
      </NavbarLink>

      <NavbarLink path={"Search"}>
        <CiSearch />
      </NavbarLink>

      <PostBtn />

      <NavbarLink path={"Explore"}>
        <CiCompass1 />
      </NavbarLink>
    </div>
  );
});

const NavbarLink = memo(function NavbarLink({ path, children }) {
  return (
    <NavLink
      to={`/${path}`}
      className="text-3xl font-extrabold transition-colors duration-300 hover:text-orangeColor active:text-orangeColor"
    >
      {children}
    </NavLink>
  );
});

const PostBtn = memo(function PostBtn() {
  const { toggleCreatePost, toggleMobileNav, setSearchValue } =
    useContext(UIContext);

  function handleTogglePost(e) {
    e.stopPropagation();
    toggleCreatePost((c) => !c);
    //if the mobile nav is open close it
    toggleMobileNav(false);
    setSearchValue([]);
  }

  return (
    <span
      onClick={handleTogglePost}
      className="text-3xl  font-bold transition-colors duration-300 hover:text-orangeColor"
    >
      <GoPlus />
    </span>
  );
});

export default BottomMobileNav;
