import React, { useState, useEffect, useCallback } from "react";
import { updateBuilding } from "../../api/building";
import "../../css/AdminDashboard.css";

const UpdateBuildingModal = React.memo(({ isOpen, onClose, onBuildingUpdated, building }) => {
  const [buildingCode, setBuildingCode] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when building changes
  useEffect(() => {
    if (building) {
      setBuildingCode(building.buildingCode || "");
      setBuildingName(building.buildingName || "");
      setFile(null);
      setError("");
    }
  }, [building]);

  const handleFileChange = useCallback((e) => {
    setFile(e.target.files[0]);
  }, []);

  const resetForm = useCallback(() => {
    if (building) {
      setBuildingCode(building.buildingCode || "");
      setBuildingName(building.buildingName || "");
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
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Error updating building."
      );
    } finally {
      setLoading(false);
    }
  }, [building, buildingCode, buildingName, file, onBuildingUpdated, onClose, resetForm]);

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
              accept="image/*"
              onChange={handleFileChange}
            />
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

