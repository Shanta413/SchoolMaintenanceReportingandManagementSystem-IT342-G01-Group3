import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import DeleteConfirmationModal from "../../components/staff/DeleteConfirmationModal";
import "../../css/Users.css";

function Users() {
  const [activeTab, setActiveTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobileNumber: "",
    password: "",
    studentDepartment: "",
    studentIdNumber: "",
    staffId: "",
    authMethod: "LOCAL",
  });

  // Helpers
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarColor = (name, authMethod) => {
    if (authMethod === "GOOGLE") return "#ea4335";
    const colors = ["#C8E6C9", "#B3E5FC", "#F8BBD0", "#FFCCBC", "#D1C4E9", "#FFF9C4"];
    if (!name) return colors[0];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Fetchers
  const fetchStudents = async () => {
    const res = await api.get("/students");
    setStudents(res.data);
  };

  const fetchStaff = async () => {
    const res = await api.get("/staff");
    setStaff(res.data);
  };

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchStudents(), fetchStaff()]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filters
  const displayStudents = students
    .filter(
      (r) =>
        r.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.createdAt && b.createdAt ? new Date(a.createdAt) - new Date(b.createdAt) : a.id - b.id));

  const displayStaff = staff
    .filter(
      (r) =>
        r.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.createdAt && b.createdAt ? new Date(a.createdAt) - new Date(b.createdAt) : a.id - b.id));

  // Handlers
  const handleEdit = (row) => {
    setSelectedRow(row);
    setFormData({
      fullname: row.fullname || "",
      email: row.email || "",
      mobileNumber: row.mobileNumber || "",
      password: "",
      studentDepartment: row.studentDepartment || "",
      studentIdNumber: row.studentIdNumber || "",
      staffId: row.staffId || "",
      authMethod: row.authMethod || "LOCAL",
    });
    setShowEditModal(true);
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setShowDeleteModal(true);
  };

  const handleAdd = async () => {
    try {
      if (activeTab === "students") {
        await api.post("/students", {
          fullname: formData.fullname,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          studentDepartment: formData.studentDepartment,
          studentIdNumber: formData.studentIdNumber,
        });
        await fetchStudents();
      } else {
        await api.post("/staff", {
          fullname: formData.fullname,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          staffId: formData.staffId,
        });
        await fetchStaff();
      }
      resetForm();
      setShowAddModal(false);
    } catch (e) {
      console.error(e);
      alert("Add failed. See console.");
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/user/update/${selectedRow.email}`, {
        fullname: formData.fullname || "",
        mobileNumber: formData.mobileNumber || "",
        password: formData.password || "",
        ...(selectedRow.authMethod === "LOCAL" &&
        formData.email &&
        formData.email !== selectedRow.email
          ? { newEmail: formData.email }
          : {}),
      });

      if (activeTab === "students") {
        await api.put(`/students/${selectedRow.id}`, {
          studentDepartment: formData.studentDepartment,
          studentIdNumber: formData.studentIdNumber,
        });
        await fetchStudents();
      } else {
        await api.put(`/staff/${selectedRow.id}`, {
          staffId: formData.staffId,
        });
        await fetchStaff();
      }

      resetForm();
      setShowEditModal(false);
    } catch (e) {
      console.error(e);
      alert("Update failed. See console.");
    }
  };

  const confirmDelete = async () => {
    try {
      if (activeTab === "students") {
        await api.delete(`/students/${selectedRow.id}`);
        await fetchStudents();
      } else {
        await api.delete(`/staff/${selectedRow.id}`);
        await fetchStaff();
      }
      setShowDeleteModal(false);
    } catch (e) {
      console.error(e);
      alert("Delete failed. See console.");
    }
  };

  const resetForm = () =>
    setFormData({
      fullname: "",
      email: "",
      mobileNumber: "",
      password: "",
      studentDepartment: "",
      studentIdNumber: "",
      staffId: "",
      authMethod: "LOCAL",
    });

  // Avatar Renderer
  const renderAvatar = (user, isStudent) => {
    const initialsAvatar = (
      <div
        className="user-avatar"
        style={{
          backgroundColor: getAvatarColor(user.fullname, user.authMethod),
          color: user.authMethod === "GOOGLE" ? "#fff" : "#333",
        }}
      >
        {getInitials(user.fullname)}
      </div>
    );

    if (!isStudent) return initialsAvatar;

    if (user.avatarUrl) {
      return (
        <>
          <img
            src={user.avatarUrl}
            alt={user.fullname}
            className="user-avatar-img"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "flex";
            }}
          />
          <div style={{ display: "none" }}>{initialsAvatar}</div>
        </>
      );
    }

    return initialsAvatar;
  };

  // Toolbar
  const renderToolbar = () => (
    <div className="users-controls">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        className="add-user-btn"
        onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}
      >
        {activeTab === "students" ? "+ Add Student" : "+ Add Staff"}
      </button>
    </div>
  );

  const renderTable = (rows) => (
    <div className="users-table-container">
      {loading ? (
        <p style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          Loading...
        </p>
      ) : rows.length === 0 ? (
        <p style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          No {activeTab} found
        </p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th></th>
              <th>NAME</th>
              <th>EMAIL</th>
              {activeTab === "students" && <th>DEPARTMENT</th>}
              <th>{activeTab === "students" ? "STUDENT ID" : "STAFF ID"}</th>
              <th>PHONE NUMBER</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>
                  <div className="user-name-cell">
                    <div className="avatar-wrapper">{renderAvatar(r, activeTab === "students")}</div>
                    <span className="user-name">{r.fullname || "—"}</span>
                  </div>
                </td>
                <td>
                  {r.email || "—"}
                  {r.authMethod === "GOOGLE" && (
                    <span
                      style={{
                        marginLeft: "7px",
                        display: "inline-flex",
                        alignItems: "center",
                        background: "#ea4335",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "11px",
                      }}
                    >
                      🔒 Google
                    </span>
                  )}
                </td>
                {activeTab === "students" && <td>{r.studentDepartment || "—"}</td>}
                <td>
                  {activeTab === "students"
                    ? r.studentIdNumber || "—"
                    : r.staffId || "—"}
                </td>
                <td>{r.mobileNumber || "—"}</td>
                <td>
                  <div className="action-buttons">
                    <button className="user-edit-btn" onClick={() => handleEdit(r)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button className="user-delete-btn" onClick={() => handleDelete(r)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>Users</h1>
          <p className="users-subtitle">Manage students and maintenance staff</p>
        </div>
      </div>

      <div className="users-tabs">
        <button
          className={`tab ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          👨‍🎓 Students ({students.length})
        </button>
        <button
          className={`tab ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          🔧 Maintenance Staff ({staff.length})
        </button>
      </div>

      {renderToolbar()}
      {activeTab === "students" ? renderTable(displayStudents) : renderTable(displayStaff)}

      {/* ADD MODAL */}
{showAddModal && (
  <div className="modal-overlay">
    <div className="modal modal-wide">
      <h2>{activeTab === "students" ? "Add Student" : "Add Staff"}</h2>
      
      {/* Two Column Form Grid */}
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {activeTab === "students" ? (
          <>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                placeholder="Enter department"
                value={formData.studentDepartment}
                onChange={(e) =>
                  setFormData({ ...formData, studentDepartment: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Student ID Number</label>
              <input
                type="text"
                placeholder="Enter student ID number"
                value={formData.studentIdNumber}
                onChange={(e) =>
                  setFormData({ ...formData, studentIdNumber: e.target.value })
                }
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Staff ID</label>
              <input
                type="text"
                placeholder="Enter staff ID"
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              />
            </div>
            <div className="form-group">
              {/* Empty placeholder for alignment */}
            </div>
          </>
        )}

        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="text"
            placeholder="Enter mobile number"
            value={formData.mobileNumber}
            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
      </div>

      <div className="modal-actions">
        <button onClick={() => setShowAddModal(false)}>Cancel</button>
        <button className="primary" onClick={handleAdd}>Add</button>
      </div>
    </div>
  </div>
)}

      {/* EDIT MODAL */}
{showEditModal && (
  <div className="modal-overlay">
    <div className="modal modal-wide">
      <h2>{activeTab === "students" ? "Edit Student" : "Edit Staff"}</h2>

      {/* Google Account Notice */}
      {selectedRow?.authMethod === "GOOGLE" && (
        <div className="google-notice">
          <span className="google-icon">🔒</span>
          <div>
            <strong>Google Account</strong>
            <p>This user signed in with Google. Email cannot be changed.</p>
          </div>
        </div>
      )}

      {/* Two Column Form Grid */}
      <div className="form-grid">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            disabled={selectedRow?.authMethod === "GOOGLE"}
            onChange={(e) => {
              if (selectedRow?.authMethod !== "GOOGLE") {
                setFormData({ ...formData, email: e.target.value });
              }
            }}
            className={selectedRow?.authMethod === "GOOGLE" ? "disabled-input" : ""}
          />
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          />
        </div>

        {activeTab === "students" ? (
          <>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                placeholder="Enter department"
                value={formData.studentDepartment}
                onChange={(e) =>
                  setFormData({ ...formData, studentDepartment: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Student ID Number</label>
              <input
                type="text"
                placeholder="Enter student ID"
                value={formData.studentIdNumber}
                onChange={(e) =>
                  setFormData({ ...formData, studentIdNumber: e.target.value })
                }
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Staff ID</label>
              <input
                type="text"
                placeholder="Enter staff ID"
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              />
            </div>
            <div className="form-group">
              {/* Empty placeholder for alignment */}
            </div>
          </>
        )}

        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="text"
            placeholder="Enter mobile number"
            value={formData.mobileNumber}
            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>New Password (optional)</label>
          <input
            type="password"
            placeholder="Leave blank to keep current password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
      </div>

      <div className="modal-actions">
        <button onClick={() => setShowEditModal(false)}>Cancel</button>
        <button className="primary" onClick={handleUpdate}>Update</button>
      </div>
    </div>
  </div>
)}

      {/* DELETE MODAL */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        issueTitle={selectedRow?.fullname}
        isDeleting={false}
        title="Delete User"
        message="Are you sure you want to delete this user?"
      />
    </div>
  );
}

export default Users;