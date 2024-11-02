import { memo } from "react";

const Sidebars = memo(function Sidebars({
  colNo,
  height = "small",
  children,
  sideColor = false,
}) {
  return (
    <div className={`hidden lg:block col-start-${colNo} row-span-2 p-5`}>
      <div
        className={`flex flex-col justify-between
           ${height === "small" ? "h-1/4" : ""} 
          
          ${height === "medium" ? "h-1/2" : ""}
  
          ${height === "full" ? "h-full" : ""} 
          
          ${sideColor ? " bg-sideColor" : ""} 
          flex w-full flex-col space-y-6  `}
      >
        {children}
      </div>
    </div>
  );
});
export default Sidebars;
