import { memo } from "react";

export const Button = memo(function Button({
  children,
  size = "medium",
  isPending,
  width,
}) {
  return (
    <button
      disabled={isPending}
      className={` rounded-sm bg-sideColor ${size === "medium" ? "p-3" : ""} ${
        size === "small" ? "px-2 py-1 " : ""
      } 
      
      ${
        size === "xs"
          ? "border-none bg-transparent p-0 text-xs hover:border-none hover:bg-transparent hover:text-orangeColor focus:border-none focus:text-orangeColor "
          : ""
      }  ${width}

      hover:g-btnHover border border-btnHover font-semibold text-black transition-all duration-500 ease-in-out hover:border-black hover:bg-btnHover  hover:text-white  focus:scale-[0.9] disabled:cursor-progress disabled:bg-btnHover disabled:text-primaryBgColor `}
    >
      {children}
    </button>
  );
});
