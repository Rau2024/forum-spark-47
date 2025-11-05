import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
    };
    categories: {
      name: string;
      color: string;
    } | null;
    post_likes: Array<{ is_like: boolean }>;
    comments: Array<{ id: string }>;
  };
  onLike?: (postId: string, isLike: boolean) => void;
  userLike?: { is_like: boolean } | null;
}

const PostCard = ({ post, onLike, userLike }: PostCardProps) => {
  const likes = post.post_likes.filter((like) => like.is_like).length;
  const dislikes = post.post_likes.filter((like) => !like.is_like).length;
  const commentCount = post.comments.length;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <Link to={`/post/${post.id}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.content}
              </p>
            </div>
            {post.categories && (
              <Badge style={{ backgroundColor: post.categories.color }}>
                {post.categories.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>by {post.profiles.username}</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {onLike && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Button
            variant={userLike?.is_like === true ? "default" : "outline"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onLike(post.id, true);
            }}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {likes}
          </Button>
          <Button
            variant={userLike?.is_like === false ? "destructive" : "outline"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onLike(post.id, false);
            }}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            {dislikes}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
