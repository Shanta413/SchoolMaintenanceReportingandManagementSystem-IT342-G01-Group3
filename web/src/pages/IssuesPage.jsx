// src/pages/IssuesPage.jsx
import React, { useState } from 'react';
import { ArrowLeft, Search, Calendar } from 'lucide-react';
import IssueCard from "../components/staff/IssueCard";
 // If in staff/ subfolder
// import './Issues.css'; // If you have CSS for issues

function IssuesPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample issue data, replace with API later!
  const issues = [
    {
      id: 1,
      title: 'Broken Laboratory Equipment',
      description: 'Microscope in Biology Lab is not functioning properly',
      priority: 'HIGH',
      location: '3rd Floor, Room 301',
      reporter: 'Juan Dela Cruz',
      date: 'Oct 20, 2025'
    },
    {
      id: 2,
      title: 'Leaking Ceiling',
      description: 'Water dripping from ceiling during heavy rain',
      priority: 'HIGH',
      location: '2nd Floor, Chemistry Lab',
      reporter: 'Maria Santos',
      date: 'Oct 19, 2025'
    },
    // ...more issues
  ];

  // Filtered results
  const filteredIssues = issues.filter(issue => {
    const matchesPriority = selectedPriority === 'all' || issue.priority.toLowerCase() === selectedPriority;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header, BuildingHeader, FilterTabs, etc. can be their own components */}
      {/* ... */}

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* Search and Filters */}
        <div style={{
          position: 'relative',
          marginTop: '24px',
          marginBottom: '24px'
        }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Search issues by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          />
        </div>
        {/* Issue List */}
        <div style={{ marginTop: '24px' }}>
          {filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          {filteredIssues.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              No issues found matching your filters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default IssuesPage;
