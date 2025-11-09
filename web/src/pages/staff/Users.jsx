import React, { useState, useEffect } from "react";
import api from "../../api/axios";
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
  });

  // Helper: Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper: Generate consistent color from name
  const getAvatarColor = (name) => {
    const colors = [
      "#C8E6C9", // light green
      "#B3E5FC", // light blue
      "#F8BBD0", // light pink
      "#FFCCBC", // light orange
      "#D1C4E9", // light purple
      "#FFF9C4", // light yellow
    ];
    if (!name) return colors[0];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // ===== Fetchers =====
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

  // ===== Filters =====
  const displayStudents = students.filter(
    (r) =>
      r.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayStaff = staff.filter(
    (r) =>
      r.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== Handlers =====
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
    });
    setShowEditModal(true);
  };
  const handleDelete = (row) => {
    setSelectedRow(row);
    setShowDeleteModal(true);
  };

  // ===== Create =====
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
      setShowAddModal(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Add failed. See console.");
    }
  };

  // ===== Update =====
  const handleUpdate = async () => {
    try {
      await api.put(`/user/update/${selectedRow.email}`, {
        fullname: formData.fullname || "",
        mobileNumber: formData.mobileNumber || "",
        password: formData.password || "",
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

      setShowEditModal(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Update failed. See console.");
    }
  };

  // ===== Delete =====
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
    });

  // Helper: Render avatar (image or initials)
  const renderAvatar = (user, isStudent) => {
    // For staff: always show initials
    if (!isStudent) {
      return (
        <div
          className="user-avatar"
          style={{ backgroundColor: getAvatarColor(user.fullname) }}
        >
          {getInitials(user.fullname)}
        </div>
      );
    }

    // For students: show image if available, otherwise initials
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={user.fullname}
          className="user-avatar-img"
          onError={(e) => {
            // If image fails to load, replace with initials
            e.target.style.display = "none";
            e.target.nextElementSibling.style.display = "flex";
          }}
        />
      );
    }

    return (
      <div
        className="user-avatar"
        style={{ backgroundColor: getAvatarColor(user.fullname) }}
      >
        {getInitials(user.fullname)}
      </div>
    );
  };

  // ===== Renders =====
  const renderToolbar = () => (
    <div className="users-controls">
      <div className="search-box">
        <span className="search-icon">🔍</span>
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
                    <div className="avatar-wrapper">
                      {renderAvatar(r, activeTab === "students")}
                      {/* Fallback initials (hidden by default, shown on image error) */}
                      {activeTab === "students" && r.avatarUrl && (
                        <div
                          className="user-avatar"
                          style={{
                            backgroundColor: getAvatarColor(r.fullname),
                            display: "none",
                          }}
                        >
                          {getInitials(r.fullname)}
                        </div>
                      )}
                    </div>
                    <span className="user-name">{r.fullname || "—"}</span>
                  </div>
                </td>
                <td>{r.email || "—"}</td>
                {activeTab === "students" && <td>{r.studentDepartment || "—"}</td>}
                <td>
                  {activeTab === "students"
                    ? r.studentIdNumber || "—"
                    : r.staffId || "—"}
                </td>
                <td>{r.mobileNumber || "—"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(r)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(r)}
                      title="Delete"
                    >
                      🗑️
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
          <span className="tab-icon">👨‍🎓</span>
          Students ({students.length})
        </button>
        <button
          className={`tab ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          <span className="tab-icon">🔧</span>
          Maintenance Staff ({staff.length})
        </button>
      </div>

      {renderToolbar()}

      {activeTab === "students"
        ? renderTable(displayStudents)
        : renderTable(displayStaff)}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{activeTab === "students" ? "Add Student" : "Add Staff"}</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {activeTab === "students" ? (
              <>
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.studentDepartment}
                  onChange={(e) =>
                    setFormData({ ...formData, studentDepartment: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Student ID Number"
                  value={formData.studentIdNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, studentIdNumber: e.target.value })
                  }
                />
              </>
            ) : (
              <input
                type="text"
                placeholder="Staff ID"
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              />
            )}

            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="primary" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{activeTab === "students" ? "Edit Student" : "Edit Staff"}</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />

            {activeTab === "students" ? (
              <>
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.studentDepartment}
                  onChange={(e) =>
                    setFormData({ ...formData, studentDepartment: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Student ID"
                  value={formData.studentIdNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, studentIdNumber: e.target.value })
                  }
                />
              </>
            ) : (
              <input
                type="text"
                placeholder="Staff ID"
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              />
            )}

            <input
              type="text"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
            />
            <input
              type="password"
              placeholder="New Password (optional)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="primary" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal confirm">
            <h3>Are you sure you want to delete this user?</h3>
            <p>{selectedRow?.fullname}</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;