import { memo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { logOutUser } from "../Actions/functions";

const TopMobileNav = memo(function TopMobileNav() {
  return (
    <div className="flex w-full  basis-[5%] items-center justify-between bg-sideColor px-4 py-5 lg:hidden">
      <p
        className={`cursor-default font-bold transition-all duration-500   
             ease-in-out lg:block lg:justify-self-start`}
      >
        Frenzy
      </p>

      <LogOutBtn />
    </div>
  );
});

const LogOutBtn = memo(function LogOutBtn() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate: logOutFn, isPending } = useMutation({
    mutationFn: logOutUser,

    onSuccess: () => {
      //remove all queries
      queryClient.removeQueries();

      //go back to the sign in page
      navigate("/");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <button
      disabled={isPending}
      onClick={logOutFn}
      className=" font-bold transition-all  duration-300 hover:text-orangeColor "
    >
      Log Out
    </button>
  );
});

export default TopMobileNav;
