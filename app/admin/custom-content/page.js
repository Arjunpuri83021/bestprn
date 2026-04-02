'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import Protected from '../Protected'
import AdminNavbar from '../components/AdminNavbar'
import RichTextEditor from '../components/RichTextEditor'
import '../AdminStyles.css'

const getSlugPlaceholder = (pageType) => {
  switch (pageType) {
    case 'tag':
      return 'e.g., blowjob, milf, anal'
    case 'pornstar':
      return 'e.g., mia-khalifa, riley-reid'
    case 'category':
      return 'e.g., chochoxscout69, comxxx, lesbify'
    case 'indian':
      return 'indian'
    case 'hijabi':
      return 'hijabi'
    case 'new-videos':
      return 'new-videos'
    case 'popular':
      return 'popular'
    case 'categories-page':
      return 'categories'
    case 'home':
      return 'home'
    default:
      return 'Enter slug'
  }
}

const getSlugHelper = (pageType) => {
  switch (pageType) {
    case 'tag':
      return 'Tag name as it appears in URL (e.g., /tag/blowjob)'
    case 'pornstar':
      return 'Pornstar name as it appears in URL (e.g., /pornstar/mia-khalifa)'
    case 'category':
      return 'Category name from your list (chochoxscout69, comxxx, etc.)'
    case 'indian':
      return 'For /indian page - use "indian" as slug'
    case 'hijabi':
      return 'For /hijabi page - use "hijabi" as slug'
    case 'new-videos':
      return 'For new videos page - use "new-videos" as slug'
    case 'popular':
      return 'For popular page - use "popular" as slug'
    case 'categories-page':
      return 'For categories listing page - use "categories" as slug'
    case 'home':
      return 'For home page - use "home" as slug'
    default:
      return 'Enter the page identifier'
  }
}

export default function CustomContentManagement() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSite, setFilterSite] = useState('bestprn') // Site filter

  const [formData, setFormData] = useState({
    pageType: 'tag',
    slug: '',
    title: '',
    content: '',
    site: 'bestprn', // Site selector in form
  })

  useEffect(() => {
    fetchContent()
  }, [currentPage, filterType, filterSite])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })

      if (filterType) params.append('pageType', filterType)

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/custom-content?${params}&site=${filterSite}`)
      const data = await response.json()

      setContent(data.content || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate content is not empty HTML
    const rawContent = formData.content || ''
    const textContent = rawContent.replace(/<[^>]*>/g, '').trim()
    if (!textContent) {
      alert('Content field cannot be empty. Please write some content.')
      return
    }

    try {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
      const payload = {
        ...formData,
        createdBy: adminData.username || 'admin',
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const url = editingContent
        ? `${baseUrl}/custom-content/${editingContent._id}?site=${formData.site || 'bestprn'}`
        : `${baseUrl}/custom-content`

      const method = editingContent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await response.json().catch(() => ({}))
        alert('Content saved successfully!')
        setShowModal(false)
        setEditingContent(null)
        setFormData({ pageType: 'tag', slug: '', title: '', content: '' })
        fetchContent()
      } else {
        const error = await response.json().catch(() => ({}))
        const errMsg = error.message || 'Error saving content'

        // If content already exists, offer to load it for editing
        if (errMsg.toLowerCase().includes('already exists')) {
          const confirmEdit = confirm(
            `⚠️ "${formData.slug}" (${formData.pageType}) ke liye content pehle se exist karta hai!\n\nKya aap existing content ko EDIT karna chahte hain?`
          )
          if (confirmEdit) {
            // Fetch the existing content and open in edit mode
            try {
              const existRes = await fetch(
                `${baseUrl}/custom-content/${formData.pageType}/${formData.slug}?site=${formData.site || 'bestprn'}`
              )
              if (existRes.ok) {
                const existingItem = await existRes.json()
                handleEdit(existingItem)
              } else {
                // Fallback: just reload the list and close modal
                fetchContent()
                setShowModal(false)
                alert('List reload kar diya — existing content dhundhkar edit karo.')
              }
            } catch {
              fetchContent()
              setShowModal(false)
            }
          }
        } else {
          alert(errMsg)
        }
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error: ' + error.message)
    }
  }

  const handleEdit = (item) => {
    setEditingContent(item)
    setFormData({
      pageType: item.pageType,
      slug: item.slug,
      title: item.title,
      content: item.content,
      site: item.site || 'bestprn',
    })
    setShowModal(true)
  }

  const handleDelete = async (id, itemSite) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/custom-content/${id}?site=${itemSite || 'bestprn'}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchContent()
      }
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const toggleStatus = async (id, itemSite) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/custom-content/${id}/toggle?site=${itemSite || 'bestprn'}`, {
        method: 'PATCH',
      })

      if (response.ok) {
        fetchContent()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Protected>
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="admin-content">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="mb-0">Custom Content Management</h2>
                  <button
                    onClick={() => {
                      setEditingContent(null)
                      setFormData({ pageType: 'tag', slug: '', title: '', content: '', site: filterSite })
                      setShowModal(true)
                    }}
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <Plus size={16} className="me-2" />
                    Add Content
                  </button>
                </div>

                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search by title or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="form-select"
                    >
                      <option value="">All Types</option>
                      <option value="tag">Tags</option>
                      <option value="pornstar">Pornstars</option>
                      <option value="category">Categories</option>
                      <option value="indian">Indian Page</option>
                      <option value="hijabi">Hijabi Page</option>
                      <option value="new-videos">New Videos Page</option>
                      <option value="popular">Popular Page</option>
                      <option value="categories-page">Categories Page</option>
                      <option value="home">Home Page</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <select
                      value={filterSite}
                      onChange={(e) => {
                        setFilterSite(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="form-select"
                    >
                      <option value="bestprn">Bestprn Site</option>
                      <option value="freshprn">Freshprn Site</option>
                    </select>
                  </div>
                </div>

                <div className="admin-table-container">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Slug</th>
                          <th>Title</th>
                          <th>Site</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredContent.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center text-muted">
                              No content found
                            </td>
                          </tr>
                        ) : (
                          filteredContent.map((item) => (
                            <tr key={item._id}>
                              <td>
                                <span className="badge bg-secondary text-capitalize">
                                  {item.pageType}
                                </span>
                              </td>
                              <td>
                                <code className="text-muted">{item.slug}</code>
                              </td>
                              <td>
                                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                  {item.title}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${item.site === 'bestprn' ? 'bg-info' : 'bg-warning'}`}>
                                  {item.site || 'freshprn'}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${item.isActive ? 'bg-success' : 'bg-danger'}`}
                                >
                                  {item.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="text-muted">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="btn btn-sm btn-outline-primary"
                                    title="Edit"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => toggleStatus(item._id, item.site)}
                                    className={`btn btn-sm ${item.isActive ? 'btn-outline-warning' : 'btn-outline-success'
                                      }`}
                                    title={item.isActive ? 'Deactivate' : 'Activate'}
                                  >
                                    {item.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item._id, item.site)}
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <li
                            key={page}
                            className={`page-item ${currentPage === page ? 'active' : ''}`}
                          >
                            <button className="page-link" onClick={() => setCurrentPage(page)}>
                              {page}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                )}

                {showModal && (
                  <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                  >
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">
                            {editingContent ? 'Edit Content' : 'Add New Content'}
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <form onSubmit={handleSubmit}>
                            <div className="row mb-3">
                              <div className="col-md-4">
                                <label className="form-label">Page Type</label>
                                <select
                                  value={formData.pageType}
                                  onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                                  className="form-select"
                                  required
                                >
                                  <option value="tag">Tag Page</option>
                                  <option value="pornstar">Pornstar Page</option>
                                  <option value="category">Category Page</option>
                                  <option value="indian">Indian Page</option>
                                  <option value="hijabi">Hijabi Page</option>
                                  <option value="new-videos">New Videos Page</option>
                                  <option value="popular">Popular Page</option>
                                  <option value="categories-page">Categories Page</option>
                                  <option value="home">Home Page</option>
                                </select>
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Slug</label>
                                <input
                                  type="text"
                                  value={formData.slug}
                                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                  className="form-control"
                                  placeholder={getSlugPlaceholder(formData.pageType)}
                                  required
                                />
                                <div className="form-text">{getSlugHelper(formData.pageType)}</div>
                              </div>

                              <div className="col-md-4">
                                <label className="form-label">Site</label>
                                <select
                                  value={formData.site}
                                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                  className="form-select"
                                  required
                                >
                                  <option value="bestprn">Bestprn</option>
                                  <option value="freshprn">Freshprn</option>
                                </select>
                                <div className="form-text">Select which site this content belongs to</div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Title</label>
                              <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="form-control"
                                placeholder="About Blowjob Sex Videos"
                                required
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Content</label>
                              <RichTextEditor
                                value={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                placeholder="Enter your custom content here. Use the toolbar to format text, add headings, links, and more..."
                              />
                            </div>
                          </form>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                          >
                            {editingContent ? 'Update' : 'Create'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  )
}
