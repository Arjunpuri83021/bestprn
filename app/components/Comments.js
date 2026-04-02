'use client';

import { useState, useEffect } from 'react';

const Comments = ({ videoId }) => {
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newComment, setNewComment] = useState({
    userName: '',
    userEmail: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.userName.trim()) {
      showMessage('Please enter your name', 'error');
      return;
    }
    
    if (!newComment.comment.trim()) {
      showMessage('Please enter your comment', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          userName: newComment.userName.trim(),
          userEmail: newComment.userEmail?.trim() || '',
          comment: newComment.comment.trim()
        })
      });
      
      const data = await response.json();

      if (data.success) {
        showMessage('Comment posted successfully!', 'success');
        // Reset form
        setNewComment({
          userName: '',
          userEmail: '',
          comment: ''
        });
        setShowForm(false);
        // Refresh comments immediately
        fetchComments();
      } else {
        showMessage(data.message || 'Error submitting comment', 'error');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      showMessage('Error submitting comment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Simple fetch without axios
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/comments/video/${videoId}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  return (
    <div className="mt-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Comments ({comments.length})
          </h2>

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            {showForm ? 'Hide' : 'Add Comment'}
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-900/30 border border-green-700 text-green-300' 
              : 'bg-red-900/30 border border-red-700 text-red-300'
          }`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Leave a Comment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={newComment.userName}
                    onChange={handleInputChange}
                    required
                    maxLength={50}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-gray-300 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="userEmail"
                    name="userEmail"
                    value={newComment.userEmail}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your email (optional)"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                  Comment <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={newComment.comment}
                  onChange={handleInputChange}
                  required
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Share your thoughts about this video..."
                />
                <div className="text-right text-sm text-gray-400 mt-1">
                  {newComment.comment.length}/1000 characters
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="text-gray-400 mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 bg-gray-800/50 rounded-xl border border-gray-700">
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{comment.userName}</h4>
                      <p className="text-sm text-gray-400">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pl-13">
                  <p className="text-gray-300 leading-relaxed">{comment.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;