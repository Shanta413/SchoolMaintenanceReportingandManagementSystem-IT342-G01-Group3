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
                    <button className="edit-btn" onClick={() => handleEdit(r)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(r)}>🗑️</button>
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
              <button className="primary" onClick={handleAdd}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{activeTab === "students" ? "Edit Student" : "Edit Staff"}</h2>

            <div style={{ marginBottom: 10 }}>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                disabled={selectedRow?.authMethod === "GOOGLE"}
                onChange={(e) => {
                  if (selectedRow?.authMethod !== "GOOGLE") {
                    setFormData({ ...formData, email: e.target.value });
                  }
                }}
              />
            </div>

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
              <button className="primary" onClick={handleUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal confirm">
            <h3>Are you sure you want to delete this user?</h3>
            <p>{selectedRow?.fullname}</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
