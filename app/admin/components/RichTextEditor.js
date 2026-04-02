'use client'

import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Underline, Link, List, ListOrdered, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export default function RichTextEditor({ value, onChange, placeholder = "Enter your content here..." }) {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [savedRange, setSavedRange] = useState(null)
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }

    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        const dropdowns = document.querySelectorAll('.dropdown-menu.show')
        dropdowns.forEach(dropdown => dropdown.classList.remove('show'))
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    handleInput()
  }

  const handleHeading = (tag) => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedContent = range.extractContents()

      const element = document.createElement(tag)
      element.appendChild(selectedContent)
      range.insertNode(element)

      selection.removeAllRanges()
      handleInput()
    }

    const dropdowns = document.querySelectorAll('.dropdown-menu.show')
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'))
  }

  const handleLinkClick = () => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0).cloneRange()
      setSavedRange(range)
      setSelectedText(selection.toString())
      setLinkText(selection.toString())
      setShowLinkModal(true)
    } else {
      alert('Please select text first to create a link')
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText && savedRange) {
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(savedRange)

      savedRange.deleteContents()

      const link = document.createElement('a')
      link.href = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
      link.textContent = linkText
      link.target = '_blank'
      link.rel = 'noopener noreferrer'

      savedRange.insertNode(link)

      selection.removeAllRanges()
      handleInput()
    }

    setShowLinkModal(false)
    setLinkUrl('')
    setLinkText('')
    setSelectedText('')
    setSavedRange(null)
  }

  const formatButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
  ]

  const alignButtons = [
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ]

  const listButtons = [
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
  ]

  return (
    <div className="rich-text-editor border rounded">
      <div className="toolbar border-bottom p-2 bg-light">
        <div className="d-flex flex-wrap gap-1">
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              onClick={(e) => {
                e.preventDefault()
                const dropdown = e.target.closest('.dropdown')
                const menu = dropdown.querySelector('.dropdown-menu')
                menu.classList.toggle('show')
              }}
              title="Headings"
            >
              <Type size={16} />
            </button>
            <ul className="dropdown-menu">
              <li><button type="button" className="dropdown-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHeading('h1') }}>Heading 1</button></li>
              <li><button type="button" className="dropdown-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHeading('h2') }}>Heading 2</button></li>
              <li><button type="button" className="dropdown-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHeading('h3') }}>Heading 3</button></li>
              <li><button type="button" className="dropdown-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHeading('h4') }}>Heading 4</button></li>
              <li><button type="button" className="dropdown-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHeading('h5') }}>Heading 5</button></li>
              <li><button type="button" className="dropdown-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHeading('h6') }}>Heading 6</button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button type="button" className="dropdown-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHeading('p') }}>Paragraph</button></li>
            </ul>
          </div>

          <div className="vr"></div>

          {formatButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                execCommand(btn.command)
              }}
              title={btn.title}
            >
              <btn.icon size={16} />
            </button>
          ))}

          <div className="vr"></div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleLinkClick()
            }}
            title="Insert Link"
          >
            <Link size={16} />
          </button>

          <div className="vr"></div>

          {alignButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                execCommand(btn.command)
              }}
              title={btn.title}
            >
              <btn.icon size={16} />
            </button>
          ))}

          <div className="vr"></div>

          {listButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                execCommand(btn.command)
              }}
              title={btn.title}
            >
              <btn.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-content p-3"
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
          outline: 'none',
        }}
        suppressContentEditableWarning={true}
        placeholder={placeholder}
      />

      {showLinkModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Insert Link</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowLinkModal(false)
                    setLinkUrl('')
                    setLinkText('')
                    setSelectedText('')
                    setSavedRange(null)
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Link Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Enter link text"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLinkModal(false)
                    setLinkUrl('')
                    setLinkText('')
                    setSelectedText('')
                    setSavedRange(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={insertLink}
                  disabled={!linkUrl || !linkText}
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rich-text-editor .editor-content:empty:before {
          content: attr(placeholder);
          color: #6c757d;
          font-style: italic;
        }

        .rich-text-editor .editor-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .rich-text-editor .editor-content h2 {
          font-size: 1.75rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .rich-text-editor .editor-content h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .rich-text-editor .editor-content h4 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .rich-text-editor .editor-content h5 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .rich-text-editor .editor-content h6 {
          font-size: 1rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .rich-text-editor .editor-content p {
          margin: 0.5rem 0;
        }

        .rich-text-editor .editor-content a {
          color: #0d6efd;
          text-decoration: underline;
        }

        .rich-text-editor .editor-content ul,
        .rich-text-editor .editor-content ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }

        .rich-text-editor .toolbar .vr {
          margin: 0 0.25rem;
        }
      `}</style>
    </div>
  )
}
