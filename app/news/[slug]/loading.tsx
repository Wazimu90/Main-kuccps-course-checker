"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
 

export default function ArticleLoading() {
  return (
    <div className="min-h-screen relative">

      <div className="relative z-10">
        {/* Back Button Skeleton */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
        </section>

        {/* Article Header Skeleton */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="h-6 w-24 bg-white/10 rounded animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded animate-pulse"></div>
              <div className="h-8 bg-white/10 rounded animate-pulse"></div>
              <div className="flex space-x-6">
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Article Image Skeleton */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="h-64 md:h-96 bg-white/10 rounded-2xl animate-pulse"></div>
          </div>
        </section>

        {/* Article Content Skeleton */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-4 bg-white/10 rounded animate-pulse"></div>
            ))}
          </div>
        </section>

        {/* Like Section Skeleton */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-24 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Comments Section Skeleton */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="h-10 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-24 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-10 w-32 bg-white/10 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
