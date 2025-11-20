// src/components/staff/IssueCard.jsx
import React from 'react';
import { Calendar } from 'lucide-react';

function IssueCard({ issue }) {
  const priorityColors = {
    HIGH: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
    MEDIUM: { bg: '#fef3c7', text: '#f59e0b', border: '#fcd34d' },
    LOW: { bg: '#d1fae5', text: '#10b981', border: '#6ee7b7' }
  };

  const colors = priorityColors[issue.priority];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      borderLeft: `4px solid ${colors.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
              {issue.title}
            </h3>
            <span style={{
              backgroundColor: colors.bg,
              color: colors.text,
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {issue.priority}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
            {issue.description}
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              📍 {issue.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              👤 {issue.reporter}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '13px' }}>
          <Calendar size={14} />
          <span>{issue.date}</span>
        </div>
      </div>
    </div>
  );
}

export default IssueCard;
