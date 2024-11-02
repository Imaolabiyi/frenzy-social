import { Button } from "./Button";

export function ErrorLoading({ retryFn, message }) {
  function HandleSubmit(e) {
    e.preventDefault();
    retryFn();
  }

  return (
    <p className="flex h-32 w-full flex-col items-center justify-center space-y-4 bg-sideColor">
      <p className="text-center font-semibold text-red-500">{message}</p>
      <form onSubmit={HandleSubmit}>
        <Button size={"small"}>Retry</Button>
      </form>
    </p>
  );
}
