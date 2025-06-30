"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  LinkIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  UnlinkIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState("")
  const [linkText, setLinkText] = React.useState("")
  const [selection, setSelection] = React.useState<Range | null>(null)

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    handleInput() // Update state after applying format
    editorRef.current?.focus() // Keep focus on editor
  }

  const handleLinkClick = () => {
    const currentSelection = window.getSelection()
    if (currentSelection && !currentSelection.isCollapsed) {
      setSelection(currentSelection.getRangeAt(0))
      setLinkText(currentSelection.toString())
      // Try to get existing link URL if selection is within a link
      const parentAnchor = currentSelection.anchorNode?.parentElement?.closest("a")
      if (parentAnchor) {
        setLinkUrl(parentAnchor.href)
      } else {
        setLinkUrl("")
      }
    } else {
      setSelection(null)
      setLinkText("")
      setLinkUrl("")
    }
    setIsLinkDialogOpen(true)
  }

  const handleInsertLink = () => {
    if (selection) {
      const currentSelection = window.getSelection()
      currentSelection?.removeAllRanges()
      currentSelection?.addRange(selection)
    }
    if (linkUrl.trim()) {
      if (linkText.trim() && selection?.collapsed) {
        // If no text selected but text is provided, insert new link
        document.execCommand("insertHTML", false, `<a href="${linkUrl}" target="_blank">${linkText}</a>`)
      } else {
        // If text selected or no text provided, apply link to selection
        applyFormat("createLink", linkUrl)
      }
    }
    setIsLinkDialogOpen(false)
    setLinkUrl("")
    setLinkText("")
    setSelection(null)
  }

  const handleUnlink = () => {
    applyFormat("unlink")
  }

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30 rounded-t-md">
        <Button type="button" variant="ghost" size="icon" onClick={() => applyFormat("bold")} aria-label="Bold">
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => applyFormat("italic")} aria-label="Italic">
          <ItalicIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("underline")}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("insertUnorderedList")}
          aria-label="Bulleted List"
        >
          <ListIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("insertOrderedList")}
          aria-label="Numbered List"
        >
          <ListOrderedIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleLinkClick} aria-label="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleUnlink} aria-label="Unlink">
          <UnlinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("formatBlock", "<h1>")}
          aria-label="Heading 1"
        >
          <Heading1Icon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("formatBlock", "<h2>")}
          aria-label="Heading 2"
        >
          <Heading2Icon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("formatBlock", "<h3>")}
          aria-label="Heading 3"
        >
          <Heading3Icon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("justifyLeft")}
          aria-label="Align Left"
        >
          <AlignLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("justifyCenter")}
          aria-label="Align Center"
        >
          <AlignCenterIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("justifyRight")}
          aria-label="Align Right"
        >
          <AlignRightIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => applyFormat("justifyFull")}
          aria-label="Justify"
        >
          <AlignJustifyIcon className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-3 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-b-md text-sm rich-text-content"
        placeholder={placeholder}
        aria-label="Rich Text Editor"
      />

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-text" className="text-right">
                Text
              </Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="col-span-3"
                placeholder="Text to display"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-url" className="text-right">
                URL
              </Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleInsertLink}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
