import React from "react";
import "../../css/DeleteConfirmationModal.css";

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  issueTitle,
  isDeleting 
}) {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="delete-modal-close" onClick={onClose}>
          ✕
        </button>

        <h2 className="delete-modal-title">Delete Issue</h2>
        
        <p className="delete-modal-message">
          Are you sure you want to delete this issue?
        </p>

        {issueTitle && (
          <div className="delete-modal-issue-title">
            <strong>"{issueTitle}"</strong>
          </div>
        )}

        <div className="delete-modal-actions">
          <button 
            className="delete-modal-cancel" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="delete-modal-delete" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}