"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, TrendingUp, Users } from "lucide-react"

interface NewsInteraction {
  articleSlug: string
  articleTitle: string
  type: "like" | "comment"
  data: any
  timestamp: string
}

export default function AdminNewsPage() {
  const [interactions, setInteractions] = useState<NewsInteraction[]>([])
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalComments: 0,
    totalArticles: 6,
    engagementRate: 0,
  })

  useEffect(() => {
    // Load interactions from localStorage
    const loadInteractions = () => {
      const stored = localStorage.getItem("newsInteractions")
      if (stored) {
        const parsedInteractions = JSON.parse(stored)
        setInteractions(parsedInteractions)

        // Calculate stats
        const likes = parsedInteractions.filter((i: NewsInteraction) => i.type === "like").length
        const comments = parsedInteractions.filter((i: NewsInteraction) => i.type === "comment").length
        const engagement = ((likes + comments) / 6) * 100 // 6 total articles

        setStats({
          totalLikes: likes,
          totalComments: comments,
          totalArticles: 6,
          engagementRate: Math.round(engagement),
        })
      }
    }

    loadInteractions()

    // Set up interval to check for new interactions
    const interval = setInterval(loadInteractions, 2000)
    return () => clearInterval(interval)
  }, [])

  const recentInteractions = interactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  const commentInteractions = interactions.filter((i) => i.type === "comment")
  const likeInteractions = interactions.filter((i) => i.type === "like")

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">News Analytics</h1>
        <p className="text-muted-foreground">Monitor news engagement and user interactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
            <p className="text-xs text-muted-foreground">Across all articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">User discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Live articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">User interaction rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactions Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentInteractions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No interactions yet</p>
              ) : (
                <div className="space-y-4">
                  {recentInteractions.map((interaction, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                      <div
                        className={`p-2 rounded-full ${
                          interaction.type === "like" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {interaction.type === "like" ? (
                          <Heart className="h-4 w-4" />
                        ) : (
                          <MessageCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{interaction.type === "like" ? "New Like" : "New Comment"}</p>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(interaction.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Article: {interaction.articleTitle}</p>
                        {interaction.type === "comment" && (
                          <div className="mt-2 p-2 bg-background rounded border-l-2 border-blue-500">
                            <p className="text-sm font-medium">{interaction.data.author}</p>
                            <p className="text-sm">{interaction.data.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {commentInteractions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {commentInteractions.map((interaction, index) => (
                    <div key={index} className="flex space-x-3 p-4 rounded-lg border">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{interaction.data.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{interaction.data.author}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(interaction.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">On: {interaction.articleTitle}</p>
                        <p className="text-sm">{interaction.data.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="likes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Likes</CardTitle>
            </CardHeader>
            <CardContent>
              {likeInteractions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No likes yet</p>
              ) : (
                <div className="space-y-4">
                  {likeInteractions.map((interaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                        <div>
                          <p className="font-medium text-green-600">{interaction.articleTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Liked {formatTimestamp(interaction.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{interaction.data.likes} total likes</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
