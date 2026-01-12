"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MessageCircle, ArrowRight, Search, Smartphone, X, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchNewsList, summarizeContent, formatDate, type NewsRow } from "@/lib/news-service"

import Footer from "@/components/footer"

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [articles, setArticles] = useState<NewsRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [showBuyDataModal, setShowBuyDataModal] = useState<boolean>(false)

  useEffect(() => {
    let active = true
      ; (async () => {
        try {
          const data = await fetchNewsList()
          if (active) setArticles(data)
        } catch (e: any) {
          if (active) setError(e?.message || "Failed to load news")
        } finally {
          if (active) setLoading(false)
        }
      })()
    return () => {
      active = false
    }
  }, [])

  const categories = ["ALL", "EDUCATION", "TECHNOLOGY", "BUSINESS", "LIFESTYLE"]

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "ALL" || article.category === selectedCategory
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summarizeContent(article.content).toLowerCase().includes(searchQuery.toLowerCase())
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
              className="text-xl text-light mb-8 max-w-2xl mx-auto"
            >
              Stay updated with the latest news and insights in education, technology, and career development
            </motion.p>
          </div>
        </section>

        {/* Search Bar */}
        <section className="py-4 px-4">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light h-4 w-4" />
              <Input
                type="text"
                placeholder="Search news articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-light placeholder:text-light focus:border-white/40"
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
                  className={`${selectedCategory === category
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
            {loading ? (
              <div className="text-center py-12">
                <p className="text-light text-lg">Loading news…</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-300 text-lg">{error}</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-light text-lg">No articles found matching your search criteria.</p>
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
                              src={article.thumbnail_url || "/placeholder.svg"}
                              alt={article.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <Badge
                              className={`absolute top-4 right-4 ${getCategoryColor(article.category || "")} text-white border-0`}
                            >
                              {article.category}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-light mb-4 line-clamp-3">{summarizeContent(article.content)}</p>

                            {/* Meta */}
                            <div className="flex items-center justify-between text-sm text-light">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(article.created_at)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{article.comments_count ?? 0}</span>
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

      {/* Buy Data Modal - Redesigned */}
      <AnimatePresence>
        {showBuyDataModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setShowBuyDataModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative max-w-lg w-full max-h-[90vh] bg-gradient-to-br from-green-900/40 via-surface to-surface border-2 border-green-500/40 rounded-3xl shadow-[0_0_60px_rgba(34,197,94,0.4)] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

              <button
                onClick={() => setShowBuyDataModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90 z-10"
              >
                <X className="w-5 h-5 text-dim hover:text-light" />
              </button>

              <div className="relative z-10 overflow-y-auto p-6 md:p-8">
                {/* Header with animated icon */}
                <div className="text-center mb-4 md:mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="inline-flex w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 items-center justify-center mb-3 md:mb-4 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                  >
                    <Smartphone className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </motion.div>

                  <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 mb-2">
                    🎉 Amazing Offer! 🎉
                  </h3>
                  <p className="text-sm md:text-base text-green-200 font-semibold">
                    Buy Data Even with Unpaid Okoa Jahazi Debt!
                  </p>
                </div>

                {/* Features with icons */}
                <div className="bg-gradient-to-br from-green-500/15 to-green-600/10 border border-green-500/30 rounded-2xl p-4 md:p-5 mb-4 md:mb-6 backdrop-blur-sm">
                  <p className="text-light text-sm md:text-base leading-relaxed mb-4 text-center">
                    Get <strong className="text-green-400">instant Safaricom data, SMS & minutes</strong> from Bfasta - no matter your Okoa Jahazi debt! 📱✨
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">⚡</div>
                      <p className="text-xs font-semibold text-green-300">Instant Activation</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">💰</div>
                      <p className="text-xs font-semibold text-green-300">Affordable Rates</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">🌟</div>
                      <p className="text-xs font-semibold text-green-300">24/7 Available</p>
                    </motion.div>
                  </div>
                </div>

                {/* Benefits list */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                  <p className="text-xs text-dim mb-3 font-semibold uppercase tracking-wide">Perfect for:</p>
                  <div className="space-y-2">
                    {[
                      '✅ Checking KUCCPS results',
                      '✅ Using this calculator anytime',
                      '✅ Staying connected with friends',
                      '✅ Emergency internet needs'
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-xs md:text-sm text-light flex items-center gap-2"
                      >
                        <span>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBuyDataModal(false)}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 text-dim hover:text-light font-medium rounded-xl transition-all"
                  >
                    Maybe Later
                  </button>
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href="https://bingwazone.co.ke/app/Bfasta"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowBuyDataModal(false)}
                    className="flex-[2] py-3 px-6 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-black rounded-xl transition-all shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] flex items-center justify-center gap-2 text-base relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative z-10">Buy Now! 🚀</span>
                    <ExternalLink className="w-5 h-5 relative z-10" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Buy Data Button */}
      <motion.button
        onClick={() => setShowBuyDataModal(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:shadow-[0_0_35px_rgba(34,197,94,0.8)] border-2 border-green-400/30 flex items-center justify-center transition-all duration-300 group"
        aria-label="Buy Safaricom Data"
      >
        <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:scale-110 transition-transform" />
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></span>
      </motion.button>

    </div>
  )
}
