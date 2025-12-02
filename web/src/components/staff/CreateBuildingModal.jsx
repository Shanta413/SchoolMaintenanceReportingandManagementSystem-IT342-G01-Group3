import React, { useState, useCallback } from "react";
import { createBuilding } from "../../api/building";
import "../../css/AdminDashboard.css";

const CreateBuildingModal = React.memo(({ isOpen, onClose, onBuildingCreated, showToast }) => {
  const [buildingCode, setBuildingCode] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate image file
  const validateFile = useCallback((file) => {
    if (!file) return null;

    // Check file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      if (showToast) {
        showToast("error", "Only PNG, JPG, and GIF images are allowed.");
      }
      return null;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      if (showToast) {
        showToast("error", "Image size must be less than 5MB.");
      }
      return null;
    }

    return file;
  }, [showToast]);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    const validFile = validateFile(selectedFile);
    
    if (validFile) {
      setFile(validFile);
    } else {
      // Clear the file input
      e.target.value = "";
      setFile(null);
    }
  }, [validateFile]);

  const resetForm = useCallback(() => {
    setBuildingCode("");
    setBuildingName("");
    setFile(null);
    setError("");
    setLoading(false);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createBuilding(
        { buildingCode, buildingName },
        file
      );

      resetForm();
      onBuildingCreated(result);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error creating building.";
      setError(errorMessage);
      if (showToast) {
        showToast("error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [buildingCode, buildingName, file, onBuildingCreated, onClose, resetForm, showToast]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content building-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create Building</h2>
        <form onSubmit={handleSubmit} className="building-form">
          <label>
            Building Code
            <input
              type="text"
              value={buildingCode}
              onChange={(e) => setBuildingCode(e.target.value)}
              placeholder="e.g., SAL, CBA, LIB"
              required
            />
          </label>
          <label>
            Building Name
            <input
              type="text"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              placeholder="e.g., Science and Laboratory"
              required
            />
          </label>
          <label>
            Building Image
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleFileChange}
              required
            />
            {file && (
              <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#059669' }}>
                ✓ {file.name}
              </div>
            )}
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Building"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CreateBuildingModal.displayName = "CreateBuildingModal";

export default CreateBuildingModal;