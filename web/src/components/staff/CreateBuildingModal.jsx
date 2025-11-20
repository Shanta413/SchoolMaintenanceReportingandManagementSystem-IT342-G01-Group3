import React, { useState } from "react";
import { createBuilding } from "../../api/building";

function CreateBuildingModal({ isOpen, onClose, onBuildingCreated }) {
  const [buildingCode, setBuildingCode] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  
  const resetForm = () => {
    setBuildingCode(""); 
    setBuildingName(""); 
    setFile(null); 
    setError(""); 
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError("");
    
    try {
      const buildingData = { buildingCode, buildingName };
      const result = await createBuilding(buildingData, file);
      
      resetForm();
      onBuildingCreated(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error creating building.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create Building</h2>
        <form onSubmit={handleSubmit} className="create-building-form">
          <label>
            Building Code
            <input
              type="text"
              value={buildingCode}
              onChange={e => setBuildingCode(e.target.value)}
              placeholder="e.g., SAL, CBA, LIB"
              required
            />
          </label>
          <label>
            Building Name
            <input
              type="text"
              value={buildingName}
              onChange={e => setBuildingName(e.target.value)}
              placeholder="e.g., Science and Laboratory"
              required
            />
          </label>
          <label>
            Building Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Building"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
          width: 450px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }
        
        .create-building-form label {
          display: block;
          margin-bottom: 1rem;
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .create-building-form input[type="text"],
        .create-building-form input[type="file"] {
          width: 100%;
          margin-top: 0.375rem;
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .create-building-form input[type="text"]:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .create-building-form input[type="text"]::placeholder {
          color: #9ca3af;
        }
        
        .form-error {
          color: #dc2626;
          background: #fee2e2;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        
        .modal-actions button {
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .modal-actions button[type="button"] {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
        }
        
        .modal-actions button[type="button"]:hover:not(:disabled) {
          background: #f9fafb;
        }
        
        .modal-actions button[type="submit"] {
          background: #2563eb;
          border: none;
          color: white;
        }
        
        .modal-actions button[type="submit"]:hover:not(:disabled) {
          background: #1d4ed8;
        }
        
        .modal-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default CreateBuildingModal;