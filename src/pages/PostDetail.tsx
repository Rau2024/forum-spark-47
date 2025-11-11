import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CommentCard from "@/components/CommentCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

const commentSchema = z.string().trim().min(3, "Comment must be at least 3 characters").max(1000, "Comment must be less than 1000 characters");

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userPostLike, setUserPostLike] = useState<any>(null);
  const [userCommentLikes, setUserCommentLikes] = useState<any[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      fetchUserLikes();
    }
  }, [user, id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles(username),
        post_likes(is_like)
      `)
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Error loading post");
      navigate("/");
      return;
    }

    // Fetch categories for this post
    const { data: postCats } = await supabase
      .from("post_categories")
      .select("category_id, categories(name, color)")
      .eq("post_id", id);

    setPost({
      ...data,
      categories: postCats?.map((pc: any) => pc.categories) || [],
    });
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profiles(username),
        comment_likes(is_like)
      `)
      .eq("post_id", id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  const fetchUserLikes = async () => {
    const { data: postLike } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    setUserPostLike(postLike);

    const { data: commentLikes } = await supabase
      .from("comment_likes")
      .select("*")
      .eq("user_id", user.id);

    setUserCommentLikes(commentLikes || []);
  };

  const handlePostLike = async (isLike: boolean) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    if (userPostLike) {
      if (userPostLike.is_like === isLike) {
        await supabase.from("post_likes").delete().eq("id", userPostLike.id);
      } else {
        await supabase
          .from("post_likes")
          .update({ is_like: isLike })
          .eq("id", userPostLike.id);
      }
    } else {
      await supabase.from("post_likes").insert({
        post_id: id,
        user_id: user.id,
        is_like: isLike,
      });
    }

    fetchPost();
    fetchUserLikes();
  };

  const handleCommentLike = async (commentId: string, isLike: boolean) => {
    if (!user) {
      toast.error("Please login to like comments");
      return;
    }

    const existingLike = userCommentLikes.find((like) => like.comment_id === commentId);

    if (existingLike) {
      if (existingLike.is_like === isLike) {
        await supabase.from("comment_likes").delete().eq("id", existingLike.id);
      } else {
        await supabase
          .from("comment_likes")
          .update({ is_like: isLike })
          .eq("id", existingLike.id);
      }
    } else {
      await supabase.from("comment_likes").insert({
        comment_id: commentId,
        user_id: user.id,
        is_like: isLike,
      });
    }

    fetchComments();
    fetchUserLikes();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    try {
      commentSchema.parse(newComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const { error } = await supabase.from("comments").insert({
      content: newComment.trim(),
      post_id: id,
      author_id: user.id,
    });

    if (error) {
      toast.error("Error posting comment");
    } else {
      setNewComment("");
      fetchComments();
      toast.success("Comment posted!");
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const likes = post.post_likes.filter((like: any) => like.is_like).length;
  const dislikes = post.post_likes.filter((like: any) => !like.is_like).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to posts
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4 break-words overflow-wrap-anywhere">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>by {post.profiles.username}</span>
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category: any, index: number) => (
                    <Badge key={index} style={{ backgroundColor: category.color }}>
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap mb-6 break-words">{post.content}</p>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button
                variant={userPostLike?.is_like === true ? "default" : "outline"}
                onClick={() => handlePostLike(true)}
                disabled={!user}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {likes}
              </Button>
              <Button
                variant={userPostLike?.is_like === false ? "destructive" : "outline"}
                onClick={() => handlePostLike(false)}
                disabled={!user}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                {dislikes}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Add a Comment</h2>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={handleAddComment} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
                <Button type="submit">Post Comment</Button>
              </form>
            ) : (
              <p className="text-muted-foreground">Please login to comment</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Comments ({comments.length})
          </h2>
          {comments.length === 0 ? (
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onLike={user ? handleCommentLike : undefined}
                userLike={userCommentLikes.find((like) => like.comment_id === comment.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
