"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, MessageCircle, Heart, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getInitials, isValidCommentPayload } from "@/lib/comment-utils"
import { sanitizeHtml } from "@/lib/news-service"
import { fetchNewsBySlug, type NewsRow } from "@/lib/news-service"

import Footer from "@/components/footer"
import ChatbotPlaceholder from "@/components/chatbot/ChatbotPlaceholder"

interface UiComment {
  id: string
  name: string
  comment: string
  created_at: string
}

export default function NewsArticlePage() {
  const params = useParams()
  const slug = params.slug as string

  const [article, setArticle] = useState<NewsRow | null>(null)
  const [likes, setLikes] = useState<number>(0)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<UiComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState("")

  useEffect(() => {
    let active = true
      ; (async () => {
        try {
          const a = await fetchNewsBySlug(slug)
          if (!active) return
          if (a) {
            setArticle(a)
            setLikes(a.likes_count ?? 0)
            const res = await fetch(`/api/news/${a.id}/comments`, { cache: "no-store" })
            const list = await res.json()
            if (active) setComments(list)
          } else {
            setArticle(null)
          }
        } catch {
          setArticle(null)
        }
      })()
    return () => {
      active = false
    }
  }, [slug])

  const handleLike = async () => {
    if (!article || isLiked) return

    // Optimistic update
    setIsLiked(true)
    setLikes((prev) => prev + 1)

    try {
      const res = await fetch(`/api/news/${article.id}/like`, { method: "POST" })
      if (res.status === 409) {
        // Already liked, keep optimistic state
        return
      }

      if (!res.ok) {
        // Revert on error
        setIsLiked(false)
        setLikes((prev) => prev - 1)
        return
      }

      const json = await res.json()
      setLikes(Number(json?.likes_count ?? likes))
    } catch {
      // Revert on network error
      setIsLiked(false)
      setLikes((prev) => prev - 1)
    }
  }

  const handleComment = async () => {
    if (!article) return
    if (isValidCommentPayload(authorName, newComment)) {
      try {
        const res = await fetch(`/api/news/${article.id}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: authorName, comment: newComment }),
        })
        const json = await res.json()
        const inserted = json?.inserted as UiComment | undefined
        if (inserted) setComments((prev) => [inserted, ...prev])
        setNewComment("")
        setAuthorName("")
      } catch { }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "EDUCATION":
        return "bg-blue-500"
      case "TECHNOLOGY":
        return "bg-purple-500"
      case "BUSINESS":
        return "bg-green-500"
      case "LIFESTYLE":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
          <Link href="/news">
            <Button className="bg-white text-black hover:bg-white/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const relatedArticles: never[] = []

  return (
    <div className="min-h-screen relative">

      <div className="relative z-10">

        {/* Article Header */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className={`${getCategoryColor(article.category || "")} text-white border-0 mb-4`}>
                {article.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{article.title}</h1>
              <div className="flex items-center space-x-6 text-light mb-8">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.created_at).toLocaleDateString("en-KE", { dateStyle: "medium" })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments.length} Comments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>{likes} Likes</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Article Image */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl overflow-hidden"
            >
              <img
                src={article.thumbnail_url || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="news-content max-w-none"
            >
              <div
                className="text-white/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
              />
            </motion.div>
          </div>
        </section>

        {/* Like and Share Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleLike}
                      variant={isLiked ? "default" : "outline"}
                      className={`${isLiked
                        ? "bg-red-500 hover:bg-red-600 text-white border-red-500 scale-105"
                        : "border-white/20 text-light hover:bg-white/10"
                        } transition-all duration-300 active:scale-95`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current animate-bounce" : ""}`} />
                      {likes} Likes
                    </Button>
                    <div className="text-light">
                      <MessageCircle className="h-4 w-4 inline mr-1" />
                      {comments.length} Comments
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Comments Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Comments ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment Form */}
                <div className="space-y-4">
                  <Input
                    placeholder="Your name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="bg-white/5 border-white/20 text-light placeholder:text-light"
                  />
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-white/5 border-white/20 text-light placeholder:text-light min-h-[100px]"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || !authorName.trim()}
                    className="premium-btn"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-white/20 text-white">
                          {getInitials(comment.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white">{comment.name}</span>
                          <span className="text-sm text-light">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-light">{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-white mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Card
                    key={relatedArticle.id}
                    className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <Link href={`/news/${relatedArticle.slug}`}>
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={relatedArticle.image || "/placeholder.svg"}
                            alt={relatedArticle.title}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <Badge
                            className={`absolute top-2 right-2 ${getCategoryColor(relatedArticle.category)} text-white border-0 text-xs`}
                          >
                            {relatedArticle.category}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                            {relatedArticle.title}
                          </h3>
                          <p className="text-light text-sm line-clamp-2">{relatedArticle.description}</p>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* KUCCPS Questions Support Section (bottom) */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-white">Still have questions about KUCCPS Courses?</h2>
                  <p className="text-white/80">
                    Get personalised guidance on KUCCPS courses, cluster points, cut-off trends, and how the placement
                    system works.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-black hover:bg-white/90">Ask the KUCCPS Course Expert</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>KUCCPS Course Expert</DialogTitle>
                      </DialogHeader>
                      <ChatbotPlaceholder />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
