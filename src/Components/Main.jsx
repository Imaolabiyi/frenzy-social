import BottomMobileNav from "./BottomMobileNav";
import TopMobileNav from "./TopMobileNav";
import { UIContext } from "./AppLayout";
import CreatePosts from "./CreatePosts";
import { useContext } from "react";

function Main({ mainRef, children, addLatestPostToStack, numberRef }) {
  const { isCreatePost, toggleCreatePost } = useContext(UIContext);

  return (
    <main className="relative col-start-2 flex  h-full flex-col overflow-auto border-tertiaryColor lg:border-x">
      <TopMobileNav />

      <div
        ref={mainRef}
        className="relative w-full  basis-[90%] overflow-auto p-4 lg:mt-0 lg:basis-full lg:p-5"
      >
        {children}
      </div>

      <CreatePosts
        isCreatePost={isCreatePost}
        toggleCreatePost={toggleCreatePost}
        addNewPostToPage={addLatestPostToStack}
        numberRef={numberRef}
      />

      <BottomMobileNav />
    </main>
  );
}

export default Main;
