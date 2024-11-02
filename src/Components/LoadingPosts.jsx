function LoadingPosts({ numOfLoaders = 3 }) {
  return (
    <div className="flex h-full w-full animate-flasInfinite flex-col  space-y-2">
      {Array.from({ length: numOfLoaders }, (_, index) => (
        <Post key={index} />
      ))}
    </div>
  );
}

export default LoadingPosts;

function Post() {
  return (
    <div className=" bg-sideColor ">
      <PostHeader />

      <PostContent />
    </div>
  );
}

function PostHeader() {
  return (
    <h1 className="min-h-10 rounded-t-lg border-b border-primaryBgColor  px-2 py-1"></h1>
  );
}

function PostContent() {
  return <p className={`min-h-32  px-2 py-5  `}></p>;
}
