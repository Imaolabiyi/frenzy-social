import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  const loggedInfo = JSON.parse(
    localStorage.getItem("sb-jmfwsnwrjdahhxvtvqgq-auth-token"),
  );

  //if there was no logged Info we assume the data has expired
  //i added 3 zeros to it because supabase date.now() is wrong
  const hasExpired = loggedInfo
    ? Date.now() > Number(loggedInfo?.expires_at + "000")
    : true;

  useEffect(
    function () {
      if (hasExpired) navigate("/");
    },
    [hasExpired, navigate],
  );

  return !hasExpired ? children : <Link to={"/"}>Back to Login</Link>;
}

export default ProtectedRoute;
