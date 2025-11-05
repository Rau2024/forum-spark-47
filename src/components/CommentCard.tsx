import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
    };
    comment_likes: Array<{ is_like: boolean }>;
  };
  onLike?: (commentId: string, isLike: boolean) => void;
  userLike?: { is_like: boolean } | null;
}

const CommentCard = ({ comment, onLike, userLike }: CommentCardProps) => {
  const likes = comment.comment_likes.filter((like) => like.is_like).length;
  const dislikes = comment.comment_likes.filter((like) => !like.is_like).length;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{comment.profiles.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <p className="text-sm">{comment.content}</p>

        {onLike && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant={userLike?.is_like === true ? "default" : "ghost"}
              size="sm"
              onClick={() => onLike(comment.id, true)}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {likes}
            </Button>
            <Button
              variant={userLike?.is_like === false ? "destructive" : "ghost"}
              size="sm"
              onClick={() => onLike(comment.id, false)}
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              {dislikes}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CommentCard;
