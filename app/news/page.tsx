"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MessageCircle, ArrowRight, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newsArticles } from "@/lib/news-data"
import AnimatedBackground from "@/components/animated-background"
import Footer from "@/components/footer"

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const categories = ["ALL", "EDUCATION", "TECHNOLOGY", "BUSINESS", "LIFESTYLE"]

  const filteredArticles = newsArticles.filter((article) => {
    const matchesCategory = selectedCategory === "ALL" || article.category === selectedCategory
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Education News
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Stay updated with the latest news and insights in education, technology, and career development
            </motion.p>
          </div>
        </section>

        {/* Search Bar */}
        <section className="py-4 px-4">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search news articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
              />
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`${
                    selectedCategory === category
                      ? "bg-white text-black hover:bg-white/90"
                      : "border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/70 text-lg">No articles found matching your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer h-full">
                      <Link href={`/news/${article.slug}`}>
                        <CardContent className="p-0">
                          {/* Image */}
                          <div className="relative overflow-hidden rounded-t-lg">
                            <img
                              src={article.image || "/placeholder.svg"}
                              alt={article.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <Badge
                              className={`absolute top-4 right-4 ${getCategoryColor(article.category)} text-white border-0`}
                            >
                              {article.category}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-white/70 mb-4 line-clamp-3">{article.description}</p>

                            {/* Meta */}
                            <div className="flex items-center justify-between text-sm text-white/60">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{article.date}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{article.comments}</span>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
