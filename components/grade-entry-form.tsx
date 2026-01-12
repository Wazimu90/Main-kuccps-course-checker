"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"

const gradeOptions = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E"]

const subjectOptions = [
  { code: "101", name: "English" },
  { code: "102", name: "Kiswahili" },
  { code: "121", name: "Mathematics A" },
  { code: "122", name: "Mathematics B" },
  { code: "231", name: "Biology" },
  { code: "232", name: "Chemistry" },
  { code: "233", name: "Physics" },
  { code: "311", name: "History and Government" },
  { code: "312", name: "Geography" },
  { code: "313", name: "Home Science" },
  { code: "314", name: "Christian Religious Education" },
  { code: "315", name: "Islamic Religious Education" },
  { code: "316", name: "Hindu Religious Education" },
  { code: "317", name: "Philosophy" },
  { code: "443", name: "Art and Design" },
  { code: "444", name: "Music" },
  { code: "445", name: "German" },
  { code: "446", name: "French" },
  { code: "447", name: "Arabic" },
  { code: "565", name: "Agriculture" },
  { code: "571", name: "Woodwork" },
  { code: "572", name: "Metalwork" },
  { code: "573", name: "Building Construction" },
  { code: "574", name: "Electronics" },
  { code: "575", name: "Power Mechanics" },
  { code: "576", name: "Automotive" },
  { code: "581", name: "Home Science" },
  { code: "582", name: "Fashion and Beauty" },
  { code: "583", name: "Food and Nutrition" },
  { code: "584", name: "Laundry and Dry Cleaning" },
]

const diplomaCourseCategories = [
  { value: "diploma_education_and_related", label: "Education and Related" },
  { value: "diploma_business_and_related", label: "Business and Related" },
  { value: "diploma_building_construction_and_related", label: "Building Construction and Related" },
  { value: "diploma_engineering_technology_and_related", label: "Engineering Technology and Related" },
  { value: "diploma_environmental_sciences", label: "Environmental Sciences" },
  { value: "diploma_applied_sciences", label: "Applied Sciences" },
  { value: "diploma_health_sciences_and_related", label: "Health Sciences and Related" },
  { value: "diploma_food_science_and_related", label: "Food Science and Related" },
  { value: "diploma_nutrition_and_dietetics", label: "Nutrition and Dietetics" },
  { value: "diploma_social_sciences", label: "Social Sciences" },
  { value: "diploma_computing_it_and_related", label: "Computing IT and Related" },
  { value: "diploma_clothing_fashion_and_textile", label: "Clothing Fashion and Textile" },
  { value: "diploma_agricultural_sciences_and_related", label: "Agricultural Sciences and Related" },
  { value: "diploma_apiculture", label: "Apiculture" },
  { value: "diploma_natural_sciences_and_related", label: "Natural Sciences and Related" },
  { value: "diploma_tax_and_custom_administration", label: "Tax and Custom Administration" },
  {
    value: "diploma_graphics_media_studies_media_production_and_related",
    label: "Graphics Media Studies Media Production and Related",
  },
  { value: "diploma_hospitality_hotel_tourism_and_related", label: "Hospitality Hotel Tourism and Related" },
  { value: "diploma_technical_courses", label: "Technical Courses" },
  { value: "diploma_animal_health_and_related", label: "Animal Health and Related" },
  { value: "diploma_hair_dressing_and_beauty_therapy", label: "Hair Dressing and Beauty Therapy" },
  { value: "diploma_library_and_information_science", label: "Library and Information Science" },
  { value: "diploma_primary_teacher_education", label: "Primary Teacher Education" },
  { value: "diploma_music_and_related", label: "Music and Related" },
]

const certificateCourseCategories = [
  { value: "certificate_business_and_related", label: "Business and Related" },
  { value: "certificate_building_construction_and_related", label: "Building Construction and Related" },
  { value: "certificate_engineering_technology_and_related", label: "Engineering Technology and Related" },
  { value: "certificate_health_sciences_and_related", label: "Health Sciences and Related" },
  { value: "certificate_food_science_and_related", label: "Food Science and Related" },
  { value: "certificate_nutrition_and_dietetics", label: "Nutrition and Dietetics" },
  { value: "certificate_social_sciences", label: "Social Sciences" },
  { value: "certificate_environmental_sciences", label: "Environmental Sciences" },
  { value: "certificate_applied_sciences", label: "Applied Sciences" },
  { value: "certificate_it_and_related", label: "IT and Related" },
  { value: "certificate_hospitality_hotel_tourism_and_related", label: "Hospitality Hotel Tourism and Related" },
  { value: "certificate_clothing_fashion_and_textile", label: "Clothing Fashion and Textile" },
  { value: "certificate_agricultural_sciences_and_related", label: "Agricultural Sciences and Related" },
  { value: "certificate_natural_sciences_and_related", label: "Natural Sciences and Related" },
  {
    value: "certificate_graphics_media_studies_media_production_and_related",
    label: "Graphics Media Studies Media Production and Related",
  },
  { value: "certificate_technical_courses", label: "Technical Courses" },
  { value: "certificate_tax_and_custom_administration", label: "Tax and Custom Administration" },
  { value: "certificate_hair_dressing_and_beauty_therapy", label: "Hair Dressing and Beauty Therapy" },
  { value: "certificate_library_and_information_science", label: "Library and Information Science" },
  { value: "certificate_education", label: "Education" },
  { value: "certificate_animal_health", label: "Animal Health" },
  { value: "certificate_animal_health_and_related", label: "Animal Health and Related" },
]

const artisanCourseCategories = [
  { value: "artisan_business_and_related", label: "Business and Related" },
  { value: "artisan_building_construction_and_related", label: "Building Construction and Related" },
  { value: "artisan_engineering_and_technology_and_related", label: "Engineering and Technology and Related" },
  { value: "artisan_food_science_and_related", label: "Food Science and Related" },
  { value: "artisan_social_sciences", label: "Social Sciences" },
  { value: "artisan_applied_sciences", label: "Applied Sciences" },
  { value: "artisan_it_and_related", label: "IT and Related" },
  { value: "artisan_hospitality_hotel_tourism_and_related", label: "Hospitality Hotel Tourism and Related" },
  { value: "artisan_clothing_fashion_and_textile", label: "Clothing Fashion and Textile" },
  { value: "artisan_agricultural_sciences_and_related", label: "Agricultural Sciences and Related" },
  { value: "artisan_natural_sciences_and_related", label: "Natural Sciences and Related" },
  { value: "artisan_technical_courses", label: "Technical Courses" },
  { value: "artisan_hair_dressing_and_beauty_therapy", label: "Hair Dressing and Beauty Therapy" },
  { value: "artisan_library_and_information_sciences", label: "Library and Information Sciences" },
]

const subjectGroups = [
  {
    id: "core",
    name: "Core Subjects",
    required: true,
    subjects: [
      { code: "101", name: "English" },
      { code: "102", name: "Kiswahili" },
      { code: "121", name: "Mathematics" },
    ],
  },
  {
    id: "sciences",
    name: "Sciences",
    required: true,
    minRequired: 2,
    subjects: [
      { code: "231", name: "Biology" },
      { code: "232", name: "Physics" },
      { code: "233", name: "Chemistry" },
    ],
  },
  {
    id: "humanities",
    name: "Humanities",
    required: true,
    minRequired: 1,
    subjects: [
      { code: "311", name: "History & Government" },
      { code: "312", name: "Geography" },
      { code: "313", name: "CRE" },
      { code: "314", name: "IRE" },
      { code: "315", name: "HRE" },
    ],
  },
  {
    id: "technical",
    name: "Technical Subjects",
    required: false,
    subjects: [
      { code: "443", name: "Business Studies" },
      { code: "444", name: "Agriculture" },
      { code: "451", name: "Computer Studies" },
      { code: "565", name: "Music" },
      { code: "442", name: "Art & Design" },
    ],
  },
  {
    id: "others",
    name: "Other Subjects",
    required: false,
    subjects: [
      { code: "441", name: "Home Science" },
      { code: "501", name: "French" },
      { code: "502", name: "German" },
      { code: "503", name: "Arabic" },
      { code: "504", name: "Aviation" },
      { code: "445", name: "Woodwork" },
      { code: "446", name: "Metalwork" },
      { code: "447", name: "Building & Construction" },
      { code: "448", name: "Electricity & Electronics" },
    ],
  },
]

const gradeOptionsWithPoints = [
  { label: "None", value: "none", points: 0 },
  { label: "A", value: "A", points: 12 },
  { label: "A-", value: "A-", points: 11 },
  { label: "B+", value: "B+", points: 10 },
  { label: "B", value: "B", points: 9 },
  { label: "B-", value: "B-", points: 8 },
  { label: "C+", value: "C+", points: 7 },
  { label: "C", value: "C", points: 6 },
  { label: "C-", value: "C-", points: 5 },
  { label: "D+", value: "D+", points: 4 },
  { label: "D", value: "D", points: 3 },
  { label: "D-", value: "D-", points: 2 },
  { label: "E", value: "E", points: 1 },
]

const countyOptions = [
  "BARINGO",
  "BOMET",
  "BUNGOMA",
  "BUSIA",
  "ELGEYO MARAKWET",
  "EMBU",
  "GARISSA",
  "HOMA BAY",
  "ISIOLO",
  "KAJIADO",
  "KAKAMEGA",
  "KERICHO",
  "KIAMBU",
  "KILIFI",
  "KIRINYAGA",
  "KISII",
  "KISUMU",
  "KITUI",
  "KWALE",
  "LAIKIPIA",
  "LAMU",
  "MACHAKOS",
  "MAKUENI",
  "MANDERA",
  "MARSABIT",
  "MERU",
  "MIGORI",
  "MOMBASA",
  "MURANG'A",
  "NAIROBI",
  "NAKURU",
  "NANDI",
  "NAROK",
  "NYAMIRA",
  "NYANDARUA",
  "NYERI",
  "SAMBURU",
  "SIAYA",
  "TAITA TAVETA",
  "TANA RIVER",
  "TRANSNZOIA",
  "TURKANA",
  "UASIN GISHU",
  "VIHIGA",
  "WAJIR",
]

const institutionTypeOptions = [
  { value: "All", label: "All (both ministries)" },
  { value: "Ministry of Education", label: "Ministry of Education" },
  { value: "In other ministries", label: "In other ministries" },
]

interface GradeEntryFormProps {
  category: string
  onSubmit: (data: any) => void
  onProgressUpdate?: (progress: number) => void
}

export default function GradeEntryForm({ category, onSubmit, onProgressUpdate }: GradeEntryFormProps) {
  const { toast } = useToast()
  const [meanGrade, setMeanGrade] = useState("")
  const [grades, setGrades] = useState<Record<string, string>>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCounties, setSelectedCounties] = useState<string[]>([])
  const [selectedInstitutionType, setSelectedInstitutionType] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["core"])

  useEffect(() => {
    let subjectsSelected = 0
    for (const subjectCode in grades) {
      if (grades[subjectCode] !== "none") subjectsSelected++
    }

    let progress = 0

    if (category === "degree") {
      if (subjectsSelected >= 7) progress = 100
    } else if (category === "kmtc") {
      if (subjectsSelected >= 7) progress = 100
    } else if (category === "diploma" || category === "certificate") {
      if (subjectsSelected >= 7) progress = 100
    } else if (category === "artisan") {
      if (meanGrade) progress = 100
    }

    onProgressUpdate?.(progress)
  }, [meanGrade, grades, category, onProgressUpdate])

  const handleCategoryToggle = (categoryValue: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryValue) ? prev.filter((c) => c !== categoryValue) : [...prev, categoryValue],
    )
  }

  const handleCountyToggle = (countyValue: string) => {
    setSelectedCounties((prev) =>
      prev.includes(countyValue) ? prev.filter((c) => c !== countyValue) : [...prev, countyValue],
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!meanGrade) {
      newErrors.meanGrade = "Mean grade is required"
    }

    if (category === "artisan") {
      // Artisan validation
      if (selectedCategories.length === 0) {
        newErrors.categories = "Please select at least one course category"
      }
      if (selectedCounties.length === 0) {
        newErrors.counties = "Please select at least one county"
      }
      if (!selectedInstitutionType) {
        newErrors.institutionType = "Please select an institution type"
      }
    } else {
      // Other categories validation
      let subjectsSelected = 0
      for (const subjectCode in grades) {
        if (grades[subjectCode] !== "none") {
          subjectsSelected++
        }
      }

      if (subjectsSelected < 7) {
        newErrors.subjects = "At least 7 subjects are required"
      }

      if ((category === "diploma" || category === "certificate") && selectedCategories.length === 0) {
        newErrors.categories = "Please select at least one course category"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const formData = {
      meanGrade,
      ...(category !== "artisan" && { subjects: grades }),
      ...(category === "diploma" && { courseCategories: selectedCategories }),
      ...(category === "certificate" && { courseCategories: selectedCategories }),
      ...(category === "artisan" && {
        courseCategories: selectedCategories,
        counties: selectedCounties,
        institutionType: selectedInstitutionType,
      }),
    }

    onSubmit(formData)
  }

  const handleGradeChange = (subjectCode: string, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [subjectCode]: value,
    }))

    // Clear error for this subject if it exists
    if (errors[subjectCode]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[subjectCode]
        return newErrors
      })
    }
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KCSE Results Entry</CardTitle>
          <CardDescription>
            Enter your KCSE mean grade and subject grades to find courses you qualify for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mean Grade */}
          <div className="space-y-2">
            <Label htmlFor="meanGrade">Mean Grade *</Label>
            <Select value={meanGrade} onValueChange={setMeanGrade}>
              <SelectTrigger className={errors.meanGrade ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your mean grade" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-md border border-white/10">
                {gradeOptions.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.meanGrade && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.meanGrade}
              </p>
            )}
          </div>

          {/* Subjects - Not shown for artisan */}
          {category !== "artisan" && (
            <div className="space-y-4">
              {subjectGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between bg-muted/50 px-4 py-3"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{group.name}</h3>
                      {group.required && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Required
                        </span>
                      )}
                      {group.minRequired && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Min {group.minRequired}
                        </span>
                      )}
                    </div>
                    {expandedGroups.includes(group.id) ? (
                      <ChevronUp className="h-5 w-5 text-white" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white animate-bounce-subtle" />
                    )}
                  </div>

                  {errors[group.id] && (
                    <div className="bg-destructive/10 px-4 py-2 text-sm text-destructive">{errors[group.id]}</div>
                  )}

                  {expandedGroups.includes(group.id) && (
                    <div className="divide-y divide-border">
                      {group.subjects.map((subject) => (
                        <div
                          key={subject.code}
                          className={`flex items-center justify-between p-4 ${errors[subject.code] ? "bg-destructive/5" : ""
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{subject.code}</span>
                            <span className="font-medium">{subject.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {errors[subject.code] && (
                              <span className="text-xs text-destructive">{errors[subject.code]}</span>
                            )}

                            <Select
                              value={grades[subject.code] || "none"}
                              onValueChange={(value) => handleGradeChange(subject.code, value)}
                            >
                              <SelectTrigger className={`w-24 ${errors[subject.code] ? "border-destructive" : ""}`}>
                                <SelectValue placeholder="Grade" />
                              </SelectTrigger>
                              <SelectContent className="bg-black/80 backdrop-blur-md border border-white/10">
                                {gradeOptionsWithPoints.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label} {option.value !== "none" && `(${option.points})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Course Categories - Only for Diploma */}
          {category === "diploma" && (
            <div className="space-y-4">
              <Label>Course Category * (Select one or more)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {diplomaCourseCategories.map((categoryOption) => (
                  <div key={categoryOption.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={categoryOption.value}
                      checked={selectedCategories.includes(categoryOption.value)}
                      onCheckedChange={() => handleCategoryToggle(categoryOption.value)}
                    />
                    <Label htmlFor={categoryOption.value} className="text-sm font-normal cursor-pointer">
                      {categoryOption.label}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryValue) => {
                    const category = diplomaCourseCategories.find((c) => c.value === categoryValue)
                    return (
                      <Badge key={categoryValue} variant="secondary" className="flex items-center gap-1">
                        {category?.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryToggle(categoryValue)} />
                      </Badge>
                    )
                  })}
                </div>
              )}

              {errors.categories && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.categories}
                </p>
              )}
            </div>
          )}

          {/* Course Categories - Only for Certificate */}
          {category === "certificate" && (
            <div className="space-y-4">
              <Label>Course Category * (Select one or more)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {certificateCourseCategories.map((categoryOption) => (
                  <div key={categoryOption.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={categoryOption.value}
                      checked={selectedCategories.includes(categoryOption.value)}
                      onCheckedChange={() => handleCategoryToggle(categoryOption.value)}
                    />
                    <Label htmlFor={categoryOption.value} className="text-sm font-normal cursor-pointer">
                      {categoryOption.label}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryValue) => {
                    const category = certificateCourseCategories.find((c) => c.value === categoryValue)
                    return (
                      <Badge key={categoryValue} variant="secondary" className="flex items-center gap-1">
                        {category?.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryToggle(categoryValue)} />
                      </Badge>
                    )
                  })}
                </div>
              )}

              {errors.categories && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.categories}
                </p>
              )}
            </div>
          )}

          {/* Course Categories - Only for Artisan */}
          {category === "artisan" && (
            <div className="space-y-4">
              <Label>Course Category * (Select one or more)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {artisanCourseCategories.map((categoryOption) => (
                  <div key={categoryOption.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={categoryOption.value}
                      checked={selectedCategories.includes(categoryOption.value)}
                      onCheckedChange={() => handleCategoryToggle(categoryOption.value)}
                    />
                    <Label htmlFor={categoryOption.value} className="text-sm font-normal cursor-pointer">
                      {categoryOption.label}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryValue) => {
                    const category = artisanCourseCategories.find((c) => c.value === categoryValue)
                    return (
                      <Badge key={categoryValue} variant="secondary" className="flex items-center gap-1">
                        {category?.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryToggle(categoryValue)} />
                      </Badge>
                    )
                  })}
                </div>
              )}

              {errors.categories && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.categories}
                </p>
              )}
            </div>
          )}

          {/* County Selection - Only for Artisan (Multi-select) */}
          {category === "artisan" && (
            <div className="space-y-4">
              <Label>Counties * (Select one or more)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {countyOptions.map((county) => (
                  <div key={county} className="flex items-center space-x-2">
                    <Checkbox
                      id={county}
                      checked={selectedCounties.includes(county)}
                      onCheckedChange={() => handleCountyToggle(county)}
                    />
                    <Label htmlFor={county} className="text-sm font-normal cursor-pointer">
                      {county}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedCounties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCounties.map((county) => (
                    <Badge key={county} variant="secondary" className="flex items-center gap-1">
                      {county}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleCountyToggle(county)} />
                    </Badge>
                  ))}
                </div>
              )}

              {errors.counties && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.counties}
                </p>
              )}
            </div>
          )}

          {/* Institution Type Selection - Only for Artisan */}
          {category === "artisan" && (
            <div className="space-y-2">
              <Label htmlFor="institutionType">Institution Type *</Label>
              <Select value={selectedInstitutionType} onValueChange={setSelectedInstitutionType}>
                <SelectTrigger className={errors.institutionType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-md border border-white/10">
                  {institutionTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedInstitutionType === "All" && (
                <p className="text-xs text-white/80">
                  All institution types selected: Ministry of Education + In other ministries
                </p>
              )}
              {errors.institutionType && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.institutionType}
                </p>
              )}
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full" size="lg">
            Continue to {category === "degree" ? "Cluster Weights" : "Processing"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
