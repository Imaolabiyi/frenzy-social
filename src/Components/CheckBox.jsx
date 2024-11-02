export function CheckBox({ setChecked, checked }) {
  return (
    <span
      onClick={() => setChecked((c) => !c)}
      className={`group relative flex w-12 cursor-pointer rounded-full bg-orangeColor p-1 transition-all duration-300 ease-in-out hover:bg-black`}
    >
      <span
        className={`block h-5 w-5 cursor-pointer rounded-full  bg-primaryBgColor transition-all duration-300 ease-in-out hover:bg-sideColor group-hover:bg-sideColor  ${
          checked ? "translate-x-full" : "translate-x-0"
        }`}
      ></span>
    </span>
  );
}
