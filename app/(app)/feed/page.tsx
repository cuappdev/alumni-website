import { PostList } from "@/components/feed/PostList";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <CreatePostDialog />
      </div>
      <PostList />
    </div>
  );
}
