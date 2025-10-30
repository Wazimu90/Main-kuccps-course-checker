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
import { newsArticles } from "@/lib/news-data"
import AnimatedBackground from "@/components/animated-background"
import Footer from "@/components/footer"

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
}

export default function NewsArticlePage() {
  const params = useParams()
  const slug = params.slug as string

  const [article, setArticle] = useState(newsArticles.find((a) => a.slug === slug))
  const [likes, setLikes] = useState(Math.floor(Math.random() * 100) + 20)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "John Doe",
      content: "Great article! Very informative and well-written.",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      author: "Jane Smith",
      content: "This is exactly what I was looking for. Thank you for sharing!",
      timestamp: "4 hours ago",
    },
  ])
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState("")

  useEffect(() => {
    // Save interaction data to localStorage for admin to access
    const saveInteraction = (type: "like" | "comment", data: any) => {
      const interactions = JSON.parse(localStorage.getItem("newsInteractions") || "[]")
      interactions.push({
        articleSlug: slug,
        articleTitle: article?.title,
        type,
        data,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem("newsInteractions", JSON.stringify(interactions))
    }

    if (isLiked) {
      saveInteraction("like", { likes })
    }
  }, [isLiked, likes, slug, article?.title])

  const handleLike = () => {
    if (!isLiked) {
      setLikes((prev) => prev + 1)
      setIsLiked(true)
    } else {
      setLikes((prev) => prev - 1)
      setIsLiked(false)
    }
  }

  const handleComment = () => {
    if (newComment.trim() && authorName.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: authorName,
        content: newComment,
        timestamp: "Just now",
      }

      setComments((prev) => [comment, ...prev])

      // Save to localStorage for admin
      const interactions = JSON.parse(localStorage.getItem("newsInteractions") || "[]")
      interactions.push({
        articleSlug: slug,
        articleTitle: article?.title,
        type: "comment",
        data: comment,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem("newsInteractions", JSON.stringify(interactions))

      setNewComment("")
      setAuthorName("")
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
        <AnimatedBackground />
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

  const relatedArticles = newsArticles.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3)

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Back Button */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <Link href="/news">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to News
              </Button>
            </Link>
          </div>
        </section>

        {/* Article Header */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className={`${getCategoryColor(article.category)} text-white border-0 mb-4`}>
                {article.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{article.title}</h1>
              <div className="flex items-center space-x-6 text-white/60 mb-8">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{article.date}</span>
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
                src={article.image || "/placeholder.svg"}
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
              className="prose prose-lg prose-invert max-w-none"
            >
              <div className="text-white/80 leading-relaxed whitespace-pre-line">{article.content}</div>
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
                      className={`${
                        isLiked
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "border-white/20 text-white hover:bg-white/10"
                      }`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      {likes} Likes
                    </Button>
                    <div className="text-white/60">
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
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/60"
                  />
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || !authorName.trim()}
                    className="bg-white text-black hover:bg-white/90"
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
                          {comment.author.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white">{comment.author}</span>
                          <span className="text-sm text-white/60">{comment.timestamp}</span>
                        </div>
                        <p className="text-white/80">{comment.content}</p>
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
                          <p className="text-white/70 text-sm line-clamp-2">{relatedArticle.description}</p>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </div>
  )
}
