"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Calendar,
  User,
  RefreshCw,
} from "lucide-react";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [deleting, setDeleting] = useState(new Set());

  const loadSubmissions = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/contact/submissions?page=${pageNum}&limit=10`,
      );
      if (!response.ok) {
        throw new Error(`Failed to load submissions: ${response.status}`);
      }
      const data = await response.json();
      setSubmissions(data.submissions);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error loading submissions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    setDeleting((prev) => new Set([...prev, id]));
    try {
      const response = await fetch(`/api/contact/submissions?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete submission: ${response.status}`);
      }

      // Remove from local state
      setSubmissions((prev) => prev.filter((sub) => sub.id !== id));
    } catch (err) {
      console.error("Error deleting submission:", err);
      alert("Failed to delete submission: " + err.message);
    } finally {
      setDeleting((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const toggleMessageExpansion = (id) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateMessage = (message, maxLength = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contact Submissions
          </h1>
          <p className="text-gray-600">
            Manage and review contact form submissions
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => loadSubmissions(page)}
              className="mt-2 text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.length}
                </p>
              </div>
            </div>
            <button
              onClick={() => loadSubmissions(page)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No submissions yet
            </h3>
            <p className="text-gray-600">
              Contact form submissions will appear here when received.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {submission.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {submission.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-gray-900">
                            {expandedMessages.has(submission.id)
                              ? submission.message
                              : truncateMessage(submission.message)}
                          </p>
                          {submission.message.length > 100 && (
                            <button
                              onClick={() =>
                                toggleMessageExpansion(submission.id)
                              }
                              className="flex items-center space-x-1 mt-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              {expandedMessages.has(submission.id) ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  <span>Show less</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  <span>Show more</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {formatDate(submission.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(submission.id)}
                          disabled={deleting.has(submission.id)}
                          className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">
                            {deleting.has(submission.id)
                              ? "Deleting..."
                              : "Delete"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadSubmissions(page - 1)}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadSubmissions(page + 1)}
                    disabled={page === totalPages || loading}
                    className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
