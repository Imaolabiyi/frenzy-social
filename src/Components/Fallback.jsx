function Fallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-primaryBgColor">
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Fallback;
