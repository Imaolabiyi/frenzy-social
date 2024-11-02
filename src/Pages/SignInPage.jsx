import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import toast from "react-hot-toast";

import { logInUser, signUpUser } from "../Actions/functions";
import { usernameExists } from "../Helpers/heperFunctions";

import { CheckBox } from "../Components/CheckBox";
import InputError from "../Components/InputError";
import { Button } from "../Components/Button";

function SignInPage() {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  const loggedInfo = JSON.parse(
    localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"),
  );

  //if there was no logged Info we assume the data has expired or the user has never logged in before

  //i added 3 zeros to it because supabase date.now() is wrong
  const hasExpired = loggedInfo
    ? Date.now() > Number(loggedInfo?.expires_at + "000")
    : true;

  //if the token in the storage had not expired when the user navigated to the log in page, redirect back to profile
  useEffect(
    function () {
      if (!hasExpired) {
        navigate("profile");
      }
    },
    [hasExpired, navigate, loggedInfo],
  );

  //if it has expired, return the sign in page, if not return nothing cus we are redirecting
  return hasExpired ? (
    <div className="h-dvh bg-primaryBgColor px-8 py-2 md:px-9 md:py-[2rem]">
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <p className="flex animate-flash items-center font-semibold text-black">
          <CheckBox checked={checked} setChecked={setChecked} />
          &nbsp;&nbsp;
          {checked ? "Log In" : "Sign Up"}
        </p>

        {checked ? <LogIn /> : <SignUp />}
      </div>
    </div>
  ) : null;
}

function LogIn() {
  const { handleSubmit, register, formState } = useForm();
  const { errors } = formState;

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: logInUser,
    onSuccess: () => {
      navigate(`explore`);
    },

    onError: (errors) => {
      //alert the user
      toast.error(errors.message);
    },
  });

  return (
    <div className="min-h-[350px] w-full animate-flash md:min-h-[400px] md:w-1/2 ">
      <Header>Log In</Header>
      <form onSubmit={handleSubmit(mutate)}>
        <InputGroup label={"Email"} errors={errors?.email?.message}>
          <input
            className="input-style "
            type="email"
            {...register("email", {
              required: { value: true, message: "Please enter your email" },
            })}
          />
        </InputGroup>

        <InputGroup label={"Password"} errors={errors?.password?.message}>
          <input
            className="input-style"
            type="password"
            {...register("password", {
              required: { value: true, message: "Please enter your password" },
            })}
          />
        </InputGroup>

        <Button isPending={isPending}>Log In</Button>
      </form>
    </div>
  );
}

function SignUp() {
  const { handleSubmit, register, getValues, formState, reset } = useForm();
  const { errors } = formState;

  const { mutate, isPending } = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      //if the users account was successfully created
      toast.success(
        `A verification email has been sent to ${getValues().email}`,

        //reset the form
        reset(),
      );
    },

    onError: (errors) => {
      //check if the error was username already exists one
      const userExists = usernameExists(errors.message);

      toast.error(userExists ? "Username is Taken" : errors.message);
    },
  });

  return (
    <div className="min-h-[350px] w-full animate-flash md:min-h-[400px] md:w-1/2 ">
      <Header>Sign Up</Header>

      <form className="w-full gap-4 " onSubmit={handleSubmit(mutate)}>
        <InputGroup label={"Username"} errors={errors?.userName?.message}>
          <input
            type="text"
            className="input-style"
            {...register("userName", {
              minLength: { value: 6, message: "Must be at least 6 characters" },
              maxLength: {
                value: 12,
                message: "Username must be 6-12 characters",
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message:
                  "Username can contain only numbers, letters and underscores",
              },
              required: { value: true, message: "Please enter a username" },
            })}
          />
        </InputGroup>

        <InputGroup label={"Email"} errors={errors?.email?.message}>
          <input
            className="input-style"
            {...register("email", {
              required: { value: true, message: "Please enter your email" },
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address",
              },
            })}
          />
        </InputGroup>

        <div className="flex-cols items-center justify-between md:flex">
          <InputGroup label={"Password"} errors={errors?.password?.message}>
            <input
              className="input-style"
              type="password"
              {...register("password", {
                required: {
                  value: true,
                  message: "Please enter your password",
                },
                minLength: { value: 7, message: "At least 7 characters" },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+/,
                  message:
                    "Must contain uppercase & lowercase letters and a number",
                },
              })}
            />
          </InputGroup>

          <InputGroup
            label={"Re-type Password"}
            errors={errors?.validatedPassword?.message}
          >
            <input
              className="input-style"
              type="password"
              {...register("validatedPassword", {
                required: {
                  value: true,
                  message: "Please enter your password again",
                },
                validate: {
                  function(val) {
                    return val === getValues().password
                      ? true
                      : "Password does not match";
                  },
                },
              })}
            />
          </InputGroup>
        </div>

        <Button isPending={isPending}>Sign Up</Button>
      </form>
    </div>
  );
}

export default SignInPage;

function InputGroup({ label, children, errors }) {
  return (
    <div className="mb-4 flex flex-col ">
      <label className="mb-2 font-semibold text-black">{label}</label>
      {errors ? <InputError>{errors}</InputError> : null}
      {children}
    </div>
  );
}

function Header({ children }) {
  return (
    <h2 className="text-headerTxt mb-4 text-3xl  font-extrabold ">
      {children}
    </h2>
  );
}
