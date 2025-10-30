"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminNewsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-48 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
