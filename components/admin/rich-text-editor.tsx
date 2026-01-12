"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Props = {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState({
    bold: false,
    italic: false,
    ul: false,
    ol: false,
    link: false,
  })
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkError, setLinkError] = useState("")

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ""
    }
  }, [value])

  const applyListStyling = () => {
    if (!ref.current) return
    const uls = Array.from(ref.current.querySelectorAll("ul"))
    const ols = Array.from(ref.current.querySelectorAll("ol"))
    uls.forEach((ul) => {
      ul.classList.add("list-disc", "pl-5")
    })
    ols.forEach((ol) => {
      ol.classList.add("list-decimal", "pl-5")
    })
  }

  const updateStates = () => {
    try {
      const sel = document.getSelection()
      let node: Node | null = sel && sel.anchorNode ? sel.anchorNode : null
      // Normalize to element
      if (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
      let withinUL = false
      let withinOL = false
      let withinLink = false
      let cur: Node | null = node
      const root = ref.current
      while (cur && root && cur !== root) {
        if (cur instanceof HTMLElement) {
          const tag = cur.tagName.toLowerCase()
          if (tag === "ul") withinUL = true
          if (tag === "ol") withinOL = true
          if (tag === "a") withinLink = true
        }
        cur = (cur as Node).parentNode
      }
      const bold = document.queryCommandState("bold")
      const italic = document.queryCommandState("italic")
      // queryCommandState sometimes works for lists; fallback to ancestor detection
      const ul = document.queryCommandState("insertUnorderedList") || withinUL
      const ol = document.queryCommandState("insertOrderedList") || withinOL
      setActive({ bold: !!bold, italic: !!italic, ul: !!ul, ol: !!ol, link: withinLink })
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const handler = () => updateStates()
    document.addEventListener("selectionchange", handler)
    return () => document.removeEventListener("selectionchange", handler)
  }, [])

  const exec = (cmd: string, arg?: string) => {
    try {
      document.execCommand(cmd, false, arg)
      if (ref.current) onChange(ref.current.innerHTML)
      if (cmd === "insertUnorderedList" || cmd === "insertOrderedList") applyListStyling()
      updateStates()
    } catch {
      // ignore formatting errors
    }
  }

  const clearFormattingSelection = () => {
    try {
      const sel = document.getSelection()
      if (!sel || sel.rangeCount === 0) {
        // If nothing is selected, try to remove all formatting from the entire editor
        if (ref.current) {
          ref.current.focus()
          document.execCommand("selectAll", false)
          document.execCommand("removeFormat", false)
          document.execCommand("unlink", false)
          sel?.removeAllRanges()
          onChange(ref.current.innerHTML)
          updateStates()
        }
        return
      }

      const range = sel.getRangeAt(0)
      if (!ref.current || !ref.current.contains(range.commonAncestorContainer)) return

      // Get the selected text content
      const text = range.toString()

      if (text) {
        // Delete the formatted content and insert plain text
        range.deleteContents()
        const textNode = document.createTextNode(text)
        range.insertNode(textNode)

        // Move cursor to end of inserted text
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        sel.removeAllRanges()
        sel.addRange(range)
      }

      if (ref.current) {
        onChange(ref.current.innerHTML)
        updateStates()
      }
    } catch (error) {
      console.error("Clear formatting error:", error)
      // Fallback to basic removeFormat and unlink
      try {
        document.execCommand("removeFormat", false)
        document.execCommand("unlink", false)
        if (ref.current) {
          onChange(ref.current.innerHTML)
          updateStates()
        }
      } catch { }
    }
  }

  const isValidUrl = (url: string) => {
    if (!url) return false
    if (url.startsWith("/") || url.startsWith("#")) return true
    try {
      const u = new URL(url)
      return ["http:", "https:", "mailto:", "tel:"].includes(u.protocol)
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          aria-label="Bold"
          aria-pressed={active.bold}
          variant={active.bold ? "default" : "secondary"}
          size="sm"
          onClick={() => exec("bold")}
        >
          Bold
        </Button>
        <Button
          type="button"
          aria-label="Italic"
          aria-pressed={active.italic}
          variant={active.italic ? "default" : "secondary"}
          size="sm"
          onClick={() => exec("italic")}
        >
          Italic
        </Button>
        <Button
          type="button"
          aria-label="Bulleted list"
          aria-pressed={active.ul}
          variant={active.ul ? "default" : "secondary"}
          size="sm"
          onClick={() => exec("insertUnorderedList")}
        >
          Bullets
        </Button>
        <Button
          type="button"
          aria-label="Numbered list"
          aria-pressed={active.ol}
          variant={active.ol ? "default" : "secondary"}
          size="sm"
          onClick={() => exec("insertOrderedList")}
        >
          Numbered
        </Button>
        <Button
          type="button"
          aria-label="Create link"
          aria-pressed={active.link}
          variant={active.link ? "default" : "secondary"}
          size="sm"
          onClick={() => {
            setLinkError("")
            setLinkUrl("")
            setLinkOpen(true)
          }}
        >
          Link
        </Button>
        <Button
          type="button"
          aria-label="Clear formatting"
          variant="secondary"
          size="sm"
          onClick={() => clearFormattingSelection()}
        >
          Clear
        </Button>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={() => {
          onChange(ref.current?.innerHTML || "")
          updateStates()
          applyListStyling()
        }}
        className="min-h-[200px] rounded-md border p-3 focus:outline-none bg-background"
      />
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              aria-label="Enter URL"
              placeholder="https://example.com or /internal-path"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value)
                setLinkError("")
              }}
            />
            {linkError && <div className="text-xs text-destructive">{linkError}</div>}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!isValidUrl(linkUrl)) {
                  setLinkError("Please enter a valid URL (http, https, mailto, tel, /path or #anchor)")
                  return
                }

                try {
                  const sel = document.getSelection()
                  if (!sel || sel.rangeCount === 0) {
                    setLinkError("Please select text to convert into a link")
                    return
                  }

                  const range = sel.getRangeAt(0)
                  const selectedText = range.toString()

                  if (!selectedText.trim()) {
                    setLinkError("Please select text to convert into a link")
                    return
                  }

                  // Create link element manually for better control
                  const link = document.createElement("a")
                  link.href = linkUrl
                  link.textContent = selectedText
                  link.style.color = "inherit"
                  link.style.textDecoration = "underline"

                  // Add target="_blank" for external links
                  if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
                    link.target = "_blank"
                    link.rel = "noopener noreferrer"
                  }

                  // Replace selected text with link
                  range.deleteContents()
                  range.insertNode(link)

                  // Move cursor after the link
                  range.setStartAfter(link)
                  range.setEndAfter(link)
                  sel.removeAllRanges()
                  sel.addRange(range)

                  if (ref.current) {
                    onChange(ref.current.innerHTML)
                    updateStates()
                  }

                  setLinkOpen(false)
                  setLinkUrl("")
                  setLinkError("")
                } catch (error) {
                  console.error("Link creation error:", error)
                  setLinkError("Failed to create link. Please try again.")
                }
              }}
            >
              Apply Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
