import React, { useState, useEffect, useCallback } from "react";
import { updateBuilding } from "../../api/building";
import "../../css/AdminDashboard.css";

const UpdateBuildingModal = React.memo(({ isOpen, onClose, onBuildingUpdated, building, showToast }) => {
  const [buildingCode, setBuildingCode] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when building changes
  useEffect(() => {
    if (building) {
      setBuildingCode(building.buildingCode || "");
      setBuildingName(building.buildingName || "");
      setFile(null);
      setImagePreview(building.buildingImageUrl || "");
      setError("");
    }
  }, [building]);

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
    if (!selectedFile) return;

    const validFile = validateFile(selectedFile);
    
    if (validFile) {
      setFile(validFile);
      setImagePreview(URL.createObjectURL(validFile));
    } else {
      // Clear the file input
      e.target.value = "";
      setFile(null);
      // Revert to original image if validation fails
      if (building?.buildingImageUrl) {
        setImagePreview(building.buildingImageUrl);
      } else {
        setImagePreview("");
      }
    }
  }, [validateFile, building]);

  const resetForm = useCallback(() => {
    if (building) {
      setBuildingCode(building.buildingCode || "");
      setBuildingName(building.buildingName || "");
      setImagePreview(building.buildingImageUrl || "");
    }
    setFile(null);
    setError("");
    setLoading(false);
  }, [building]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!building?.id) {
      setError("Building ID is missing!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await updateBuilding(
        building.id,
        { buildingCode, buildingName },
        file
      );
      resetForm();
      onBuildingUpdated(result);
      if (showToast) {
        showToast("success", "Building updated successfully!");
      }
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error updating building.";
      setError(errorMessage);
      if (showToast) {
        showToast("error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [building, buildingCode, buildingName, file, onBuildingUpdated, onClose, resetForm, showToast]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen || !building) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content building-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Update Building</h2>
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
            Building Image (optional - leave empty to keep current)
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleFileChange}
            />
            {/* Preview current or selected image */}
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={imagePreview}
                  alt="Building Preview"
                  style={{
                    width: '100%',
                    maxHeight: '180px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </div>
            )}
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
              {loading ? "Updating..." : "Update Building"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

UpdateBuildingModal.displayName = "UpdateBuildingModal";

export default UpdateBuildingModal;