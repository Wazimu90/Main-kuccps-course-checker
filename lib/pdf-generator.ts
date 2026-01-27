/**
 * Server-side PDF generator for agent portal
 * Mirrors the client-side PDF generation from app/results/page.tsx
 */

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export interface CourseData {
    programme_name?: string
    course_name?: string
    institution?: string
    institution_name?: string
    campus?: string
    programme_code?: string
    county?: string
    location?: string
}

export interface UserInfo {
    name: string
    email: string
    phone?: string
}

export interface PDFGenerationParams {
    courses: CourseData[]
    category: string
    userInfo: UserInfo
    resultId: string
}

/**
 * Generate PDF buffer for course results
 * @param params - PDF generation parameters
 * @returns PDF as ArrayBuffer
 */
export function generateResultsPDF(params: PDFGenerationParams): ArrayBuffer {
    const { courses, category, userInfo, resultId } = params

    const doc = new jsPDF()

    // Add Header
    doc.setFillColor(41, 128, 185) // Blue header
    doc.rect(0, 0, 210, 40, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text("KUCCPS Course Eligibility Results", 105, 20, { align: "center" })

    doc.setFontSize(12)
    doc.text(`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`, 105, 30, { align: "center" })

    // Student Info
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)

    doc.text(`Student Name: ${userInfo.name || "Student"}`, 14, 50)
    doc.text(`Email: ${userInfo.email || "N/A"}`, 14, 56)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 62)

    // Summary
    doc.setDrawColor(200, 200, 200)
    doc.line(14, 66, 196, 66)

    doc.setFontSize(14)
    doc.text("Results Summary", 14, 75)
    doc.setFontSize(11)
    doc.text(`Total Qualified Courses: ${courses.length}`, 14, 82)

    // Count unique institutions
    const institutions = new Set<string>()
    courses.forEach((c) => {
        const inst = c.institution || c.institution_name || c.campus
        if (inst) institutions.add(inst)
    })
    doc.text(`Institutions: ${institutions.size}`, 80, 82)

    // Table
    const tableColumn = ["Course Name", "Institution", "Code", "Location"]
    const tableRows = courses.map((course) => [
        course.programme_name || course.course_name || "N/A",
        course.institution || course.institution_name || course.campus || "N/A",
        course.programme_code || "N/A",
        course.county || course.location || "N/A",
    ])

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 70 }, // Course Name
            1: { cellWidth: 60 }, // Institution
        },
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text("© 2026 KUCCPS Course Checker", 14, (doc as any).internal.pageSize.height - 10)
        doc.text(`Page ${i} of ${pageCount}`, 180, (doc as any).internal.pageSize.height - 10)
    }

    // Add Result ID as small text at bottom of first page for reference
    doc.setPage(1)
    doc.setFontSize(8)
    doc.setTextColor(180)
    doc.text(`Result ID: ${resultId}`, 14, (doc as any).internal.pageSize.height - 5)

    // Return as ArrayBuffer
    return doc.output("arraybuffer")
}
