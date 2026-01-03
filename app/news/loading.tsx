"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
 

export default function NewsLoading() {
  return (
    <div className="min-h-screen relative">

      <div className="relative z-10">
        {/* Hero Section Skeleton */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="h-16 bg-white/10 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-6 bg-white/10 rounded-lg max-w-2xl mx-auto animate-pulse"></div>
          </div>
        </section>

        {/* Search Bar Skeleton */}
        <section className="py-4 px-4">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto h-10 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
        </section>

        {/* Category Filter Skeleton */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </section>

        {/* News Grid Skeleton */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-0">
                      <div className="h-48 bg-white/10 rounded-t-lg animate-pulse"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-6 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse"></div>
                          <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
