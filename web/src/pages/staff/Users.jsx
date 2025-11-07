import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import "../../css/Users.css";

function Users() {
  const [activeTab, setActiveTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobileNumber: "",
    password: "",
    studentDepartment: "",
    studentIdNumber: "",
  });

  // 🟢 Fetch students
  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🟡 Filter by name/email
  const displayStudents = students.filter(
    (student) =>
      student.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✏️ Edit
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      fullname: student.fullname,
      email: student.email,
      mobileNumber: student.mobileNumber,
      password: "",
      studentDepartment: student.studentDepartment,
      studentIdNumber: student.studentIdNumber,
    });
    setShowEditModal(true);
  };

  // 🗑️ Delete
  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  // ➕ Add Student (LOCAL auto-create backend)
  const handleAddStudent = async () => {
    try {
      await api.post("/students", {
        fullname: formData.fullname,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        studentDepartment: formData.studentDepartment,
        studentIdNumber: formData.studentIdNumber,
      });
      setShowAddModal(false);
      setFormData({
        fullname: "",
        email: "",
        mobileNumber: "",
        password: "",
        studentDepartment: "",
        studentIdNumber: "",
      });
      fetchStudents();
    } catch (err) {
      console.error("Error adding student:", err);
      alert("Failed to add student. Check console.");
    }
  };

  // ✏️ Update
  const handleUpdateStudent = async () => {
    try {
      // Update user info (fullname, mobile, password)
      await api.put(`/user/update/${selectedStudent.email}`, {
        fullname: formData.fullname || "",
        mobileNumber: formData.mobileNumber || "",
        password: formData.password || "",
      });

      // Update student info
      await api.put(`/students/${selectedStudent.id}`, {
        studentDepartment: formData.studentDepartment,
        studentIdNumber: formData.studentIdNumber,
      });

      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      console.error("Error updating student:", err);
      alert("Failed to update student. Check console.");
    }
  };

  // 🔴 Confirm Delete
  const confirmDelete = async () => {
    try {
      await api.delete(`/students/${selectedStudent.id}`);
      setShowDeleteModal(false);
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

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
          Maintenance Staff
        </button>
      </div>

      {activeTab === "students" && (
        <>
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
            <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
              + Add Student
            </button>
          </div>

          <div className="users-table-container">
            {loading ? (
              <p>Loading students...</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>DEPARTMENT</th>
                    <th>STUDENT ID</th>
                    <th>MOBILE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.fullname}</td>
                      <td>{student.email}</td>
                      <td>{student.studentDepartment || "—"}</td>
                      <td>{student.studentIdNumber || "—"}</td>
                      <td>{student.mobileNumber || "—"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(student)}
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(student)}
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
        </>
      )}

      {/* 🔹 Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Student</h2>

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

            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="primary" onClick={handleAddStudent}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Student</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />
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
            <input
              type="text"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData({ ...formData, mobileNumber: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password (optional)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="primary" onClick={handleUpdateStudent}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal confirm">
            <h3>Are you sure you want to delete this user?</h3>
            <p>{selectedStudent.fullname}</p>
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
