import React, { useState, useCallback } from "react";
import React, { useState, useCallback } from "react";
import { createBuilding } from "../../api/building";
import "../../css/AdminDashboard.css";


const CreateBuildingModal = React.memo(({ isOpen, onClose, onBuildingCreated }) => {
  const [buildingCode, setBuildingCode] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback((e) => {
    setFile(e.target.files[0]);
  }, []);


  const resetForm = useCallback(() => {

    setBuildingCode("");
    setBuildingName("");
    setFile(null);
    setError("");
    setLoading(false);
  }, []);
  }, []);

  const handleSubmit = useCallback(async (e) => {
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
      setError(
        err.response?.data?.message || err.message || "Error creating building."
      );
    } finally {
      setLoading(false);
    }
  }, [buildingCode, buildingName, file, onBuildingCreated, onClose, resetForm]);

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
              accept="image/*"
              onChange={handleFileChange}
              required
            />
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