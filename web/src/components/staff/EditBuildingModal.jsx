import React, { useState, useEffect } from "react";
import "../../css/EditBuildingModal.css";
import { updateBuilding } from "../../api/building";

const initialState = {
  buildingName: "",
  buildingCode: "",
};

function EditBuildingModal({ isOpen, building, onClose, onBuildingUpdated }) {
  const [form, setForm] = useState(initialState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (building) {
      setForm({
        buildingName: building.buildingName || "",
        buildingCode: building.buildingCode || "",
      });
      setImageFile(null);
      setImagePreview(building.buildingImageUrl || "");
      setError("");
    }
  }, [building, isOpen]);

  if (!isOpen || !building) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Send file if selected, else send null
      const updated = await updateBuilding(building.id, form, imageFile);
      onBuildingUpdated(updated);
      onClose();
    } catch (err) {
      setError("Error updating building. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Building</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Name
            <input
              type="text"
              name="buildingName"
              value={form.buildingName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Code
            <input
              type="text"
              name="buildingCode"
              value={form.buildingCode}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Building Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {/* Preview current or selected image */}
            {imagePreview && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }}
                />
              </div>
            )}
          </label>
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.18);
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          max-width: 410px;
          min-width: 300px;
          box-shadow: 0 6px 48px rgba(0,0,0,0.07);
        }
        .modal-form label {
          display: block;
          margin-bottom: 1rem;
        }
        .modal-form input[type="text"],
        .modal-form input[type="url"] {
          width: 100%;
          padding: 8px;
          margin-top: 4px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          font-size: 1rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .modal-btn {
          padding: 10px 22px;
          border-radius: 7px;
          border: none;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.16s;
        }
        .modal-btn-primary {
          background: #2563eb;
          color: #fff;
        }
        .modal-btn-primary:hover {
          background: #1e40af;
        }
        .modal-btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }
        .modal-btn-cancel:hover {
          background: #e5e7eb;
        }
        .modal-error {
          color: #d32f2f;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

export default EditBuildingModal;
