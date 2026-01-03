export const ActivityEvents = {
  COURSE_GENERATE: "user.course.generate",
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_INITIATED_CLIENT: "payment.initiated.client",
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_FAILED_INIT: "payment.failed.initiation",
  PDF_DOWNLOAD: "pdf.download",
  ADMIN_BYPASS: "admin.bypass",
  NEWS_LIKE: "user.news.like",
  NEWS_COMMENT: "user.news.comment",
} as const

export type ActivityEventType = (typeof ActivityEvents)[keyof typeof ActivityEvents]

export function isValidEventType(evt: string): evt is ActivityEventType {
  return Object.values(ActivityEvents).includes(evt as ActivityEventType)
}
