"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Download,
  Search,
  ArrowUpDown,
  MessageCircle,
  X,
  CheckCircle2,
  Filter,
  ExternalLink,
  Users,
  Award,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import UserSummary from "@/components/results/user-summary"
import CourseTable from "@/components/results/course-table"
import ChatbotAssistant from "@/components/results/chatbot-assistant"
import { supabase } from "@/lib/supabase"

export default function ResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [institutionFilter, setInstitutionFilter] = useState("all")
  const [location, setLocation] = useState("all")
  const [sortBy, setSortBy] = useState("cutoff_asc")
  const [filteredCourses, setFilteredCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showChatbot, setShowChatbot] = useState(false)
  const [showPdfDialog, setShowPdfDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("degree")
  const [availableInstitutions, setAvailableInstitutions] = useState([])
  const [availableLocations, setAvailableLocations] = useState([])
  const filtersRef = useRef(null)

  // Load results from Supabase results_cache table
  useEffect(() => {
    const loadResultsFromCache = async () => {
      try {
        const resultId = localStorage.getItem("resultId")

        if (!resultId) {
          console.error("No result ID found in localStorage")
          toast({
            title: "No Results Found",
            description: "No result ID found. Please complete the qualification process.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        console.log("Loading results for result ID:", resultId)

        // Fetch results from Supabase using result_id
        const { data: resultData, error } = await supabase
          .from("results_cache")
          .select("*")
          .eq("result_id", resultId)
          .single()

        if (error) {
          console.error("Error fetching results from cache:", error)
          toast({
            title: "Results Not Found",
            description: "Could not find your results. Please try the qualification process again.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        if (!resultData) {
          console.error("No result data found for ID:", resultId)
          toast({
            title: "Results Not Found",
            description: "Could not find your results. Please try the qualification process again.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        console.log("Result data loaded:", resultData)

        // Set payment info from localStorage (fallback data)
        const savedPaymentInfo = localStorage.getItem("paymentInfo")
        let paymentInfoFromStorage = null

        if (savedPaymentInfo) {
          try {
            paymentInfoFromStorage = JSON.parse(savedPaymentInfo)
          } catch (e) {
            console.error("Error parsing payment info:", e)
          }
        }

        const paymentInfoFromDb = {
          name: paymentInfoFromStorage?.name || "Student",
          email: paymentInfoFromStorage?.email || "student@example.com",
          phone: paymentInfoFromStorage?.phone || "",
          amount: 200,
          reference: resultData.result_id,
          timestamp: resultData.created_at || new Date().toISOString(),
        }
        setPaymentInfo(paymentInfoFromDb)

        const eligibleCourses = resultData.eligible_courses || []
        const category = resultData.category || "degree"

        console.log(`Loaded ${eligibleCourses.length} courses for category: ${category}`)

        setSelectedCategory(category)
        setAllCourses(eligibleCourses)

        // Get unique institutions from courses based on category
        const institutions = [
          ...new Set(
            eligibleCourses
              .map((course) => {
                if (category === "certificate" || category === "artisan") {
                  return course.institution
                }
                return course.institution_name || course.campus
              })
              .filter(Boolean),
          ),
        ]

        setAvailableInstitutions([
          { id: "all", label: "All Institutions" },
          ...institutions.map((inst) => ({
            id: inst.toLowerCase().replace(/\s+/g, "-"),
            label: inst,
          })),
        ])

        // Get unique locations from courses based on category
        const locations = [
          ...new Set(
            eligibleCourses
              .map((course) => {
                if (category === "certificate" || category === "artisan") {
                  return course.county
                }
                return course.location
              })
              .filter(Boolean),
          ),
        ]

        setAvailableLocations([
          { id: "all", label: "All Locations" },
          ...locations.map((loc) => ({
            id: loc.toLowerCase().replace(/\s+/g, "-"),
            label: loc,
          })),
        ])

        setIsLoading(false)
        console.log("Results loaded successfully from cache:", eligibleCourses.length, "courses")
      } catch (error) {
        console.error("Error loading results from cache:", error)
        toast({
          title: "Error Loading Results",
          description: "Failed to load your results. Please try again.",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    loadResultsFromCache()
  }, [router, toast])

  // Filter and sort courses
  useEffect(() => {
    if (isLoading || allCourses.length === 0) return

    let filtered = [...allCourses]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (course) =>
          course.programme_name?.toLowerCase().includes(query) ||
          course.course_name?.toLowerCase().includes(query) ||
          (course.institution_name && course.institution_name.toLowerCase().includes(query)) ||
          (course.institution && course.institution.toLowerCase().includes(query)) ||
          (course.campus && course.campus.toLowerCase().includes(query)) ||
          course.programme_code?.toLowerCase().includes(query),
      )
    }

    // Filter by institution
    if (institutionFilter !== "all") {
      const institutionName = availableInstitutions.find((inst) => inst.id === institutionFilter)?.label
      if (institutionName) {
        filtered = filtered.filter((course) => {
          if (selectedCategory === "certificate" || selectedCategory === "artisan") {
            return course.institution === institutionName
          }
          return course.institution_name === institutionName || course.campus === institutionName
        })
      }
    }

    // Filter by location
    if (location !== "all") {
      const locationName = availableLocations.find((loc) => loc.id === location)?.label
      if (locationName) {
        filtered = filtered.filter((course) => {
          if (selectedCategory === "certificate" || selectedCategory === "artisan") {
            return course.county && course.county.toLowerCase().includes(locationName.toLowerCase())
          }
          return course.location && course.location.toLowerCase().includes(locationName.toLowerCase())
        })
      }
    }

    // Sort courses
    switch (sortBy) {
      case "cutoff_asc":
        filtered.sort((a, b) => (a.cutoff || 0) - (b.cutoff || 0))
        break
      case "cutoff_desc":
        filtered.sort((a, b) => (b.cutoff || 0) - (a.cutoff || 0))
        break
      case "institution_asc":
        filtered.sort((a, b) => {
          const aInst =
            selectedCategory === "certificate" || selectedCategory === "artisan"
              ? a.institution || ""
              : a.institution_name || a.campus || ""
          const bInst =
            selectedCategory === "certificate" || selectedCategory === "artisan"
              ? b.institution || ""
              : b.institution_name || b.campus || ""
          return aInst.localeCompare(bInst)
        })
        break
      case "institution_desc":
        filtered.sort((a, b) => {
          const aInst =
            selectedCategory === "certificate" || selectedCategory === "artisan"
              ? a.institution || ""
              : a.institution_name || a.campus || ""
          const bInst =
            selectedCategory === "certificate" || selectedCategory === "artisan"
              ? b.institution || ""
              : b.institution_name || b.campus || ""
          return bInst.localeCompare(aInst)
        })
        break
      case "name_asc":
        filtered.sort((a, b) => (a.programme_name || a.course_name).localeCompare(b.programme_name || b.course_name))
        break
      case "name_desc":
        filtered.sort((a, b) => (b.programme_name || b.course_name).localeCompare(a.programme_name || a.course_name))
        break
      default:
        break
    }

    setFilteredCourses(filtered)
  }, [
    allCourses,
    searchQuery,
    institutionFilter,
    location,
    sortBy,
    isLoading,
    availableInstitutions,
    availableLocations,
    selectedCategory,
  ])

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleDownloadPDF = async () => {
    setShowPdfDialog(false)
    toast({
      title: "Generating PDF",
      description: "Your results PDF is being generated and will download shortly.",
    })

    try {
      // Use browser print fallback
      console.log("Using browser print for PDF generation")

      // Create a printable version
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>KUCCPS Course Eligibility Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin: 20px 0; padding: 15px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KUCCPS Course Eligibility Results</h1>
          <p>Student: ${paymentInfo?.name || "Student"} | Email: ${paymentInfo?.email || "student@example.com"}</p>
          <p>Category: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} | Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <h2>Results Summary</h2>
          <p>Total Qualified Courses: ${filteredCourses.length}</p>
          <p>Number of Institutions: ${[...new Set(filteredCourses.map((c) => c.institution || c.institution_name || c.campus))].length}</p>
          <p>Highest Cutoff: ${filteredCourses.length > 0 ? Math.max(...filteredCourses.map((c) => c.cutoff || 0)).toFixed(1) : "0"}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Institution</th>
              <th>Code</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCourses
              .map(
                (course) => `
              <tr>
                <td>${course.programme_name || course.course_name}</td>
                <td>${course.institution || course.institution_name || course.campus || "N/A"}</td>
                <td>${course.programme_code}</td>
                <td>${course.county || course.location || "N/A"}</td>
                <td>Qualified</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 KUCCPS Course Checker - For official applications, visit https://students.kuccps.net</p>
        </div>
      </body>
      </html>
    `)
        printWindow.document.close()
        printWindow.print()
      }

      toast({
        title: "Print Dialog Opened",
        description: "Please use your browser's print function to save as PDF.",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "Error Opening Print Dialog",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      })
    }
  }

  const getResultsSummary = () => {
    const totalCourses = filteredCourses.length
    const uniqueInstitutions =
      filteredCourses.length > 0
        ? [
            ...new Set(
              filteredCourses
                .map((course) => {
                  if (selectedCategory === "certificate" || selectedCategory === "artisan") {
                    return course.institution
                  }
                  return course.institution_name || course.campus
                })
                .filter(Boolean),
            ),
          ].length
        : 0
    const highestCluster =
      filteredCourses.length > 0 ? Math.max(...filteredCourses.map((course) => course.cluster || 0), 0) : 0

    return { totalCourses, uniqueInstitutions, highestCluster }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
          <h2 className="mb-2 text-2xl font-bold">Loading Your Results</h2>
          <p className="text-muted-foreground">We're preparing your personalized course eligibility results...</p>
        </div>
      </div>
    )
  }

  const { totalCourses, uniqueInstitutions, highestCluster } = getResultsSummary()

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-center text-3xl font-bold md:text-4xl">Your Course Eligibility Results</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Based on your KCSE grades, here are all the {selectedCategory} courses you qualify for
        </p>
      </motion.div>

      {/* User Summary */}
      <UserSummary paymentInfo={paymentInfo} />

      {/* Results Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <Card className="bg-white shadow-md rounded-xl">
          <CardContent className="p-6 bg-[#F8FAFC] text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-center">Results Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-primary mr-2" />
                  <span className="text-3xl font-bold text-primary">{totalCourses}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Qualified Courses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Building2 className="h-8 w-8 text-primary mr-2" />
                  <span className="text-3xl font-bold text-primary">{uniqueInstitutions || "N/A"}</span>
                </div>
                <p className="text-sm text-muted-foreground">Number of Institutions</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-primary mr-2" />
                  <span className="text-3xl font-bold text-primary">{highestCluster}</span>
                </div>
                <p className="text-sm text-muted-foreground">Highest Cluster Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="mt-8">
        {/* Category Display */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 text-lg">
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Courses
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              {totalCourses} courses found
            </Badge>
          </div>

          <div className="hidden md:flex md:items-center md:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-transparent"
              onClick={() => setShowPdfDialog(true)}
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent" asChild>
              <a href="https://students.kuccps.net" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span>Apply on KUCCPS</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowPdfDialog(true)}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://students.kuccps.net" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses or institutions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex md:items-center md:gap-2">
            <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Institution" />
              </SelectTrigger>
              <SelectContent>
                {availableInstitutions.map((institution) => (
                  <SelectItem key={institution.id} value={institution.id}>
                    {institution.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1 bg-transparent">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("cutoff_asc")}>Cutoff: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("cutoff_desc")}>Cutoff: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("institution_asc")}>Institution: A to Z</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("institution_desc")}>Institution: Z to A</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name_asc")}>Course Name: A to Z</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name_desc")}>Course Name: Z to A</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Filters Button */}
          <div className="flex md:hidden">
            <Button
              variant="outline"
              className="flex w-full items-center justify-center gap-2 bg-transparent"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span>Filters & Sort</span>
            </Button>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div
              ref={filtersRef}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border bg-background p-4 shadow-lg md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters & Sort</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Institution</label>
                  <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInstitutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cutoff_asc">Cutoff: Low to High</SelectItem>
                      <SelectItem value="cutoff_desc">Cutoff: High to Low</SelectItem>
                      <SelectItem value="institution_asc">Institution: A to Z</SelectItem>
                      <SelectItem value="institution_desc">Institution: Z to A</SelectItem>
                      <SelectItem value="name_asc">Course Name: A to Z</SelectItem>
                      <SelectItem value="name_desc">Course Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Content */}
        <CourseTable courses={filteredCourses} category={selectedCategory} isLoading={isLoading} />
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setShowChatbot(true)}
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Need Help Choosing a Course?</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chatbot */}
      <ChatbotAssistant
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        selectedCategory={selectedCategory}
        qualifiedCourses={filteredCourses}
      />

      {/* PDF Download Dialog */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Results PDF</DialogTitle>
            <DialogDescription>
              Get a comprehensive report of all courses you qualify for using your browser's built-in PDF feature
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold">Your PDF Report Includes:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Complete list of all qualifying courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Institution details and locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Cluster point analysis and cutoffs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>KUCCPS portal QR code for easy access</span>
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📄 How to Save as PDF:</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>1.</strong> Click "Download PDF" below
                    <br />
                    <strong>2.</strong> When the print dialog opens, find the <strong>"Destination"</strong> dropdown
                    <br />
                    <strong>3.</strong> Select <strong>"Save as PDF"</strong> from the dropdown
                    <br />
                    <strong>4.</strong> Click "Save" to download your results
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPdfDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownloadPDF}>Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
