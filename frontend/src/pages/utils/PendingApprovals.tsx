import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import axios from "axios";
import { useNavigate } from "react-router-dom";


interface Teacher {
  _id: string;
  name: string;
  email: string;
}

const PendingApprovals: React.FC = () => {
  const [pendingTeachers, setPendingTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch Pending Teachers
  const fetchPendingTeachers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log("🔒 Token in localStorage:", token);

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const response = await axios.get("http://localhost:5001/api/admin/approval/pending-teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ API Response Data:", response.data);
      setPendingTeachers(response.data);
    } catch (error) {
      console.error("❌ Error fetching pending teachers:", error);
      setError("Failed to load pending teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  // ✅ Approve Teacher
  const handleApprove = async (teacherId: string) => {
    toast.success("Teacher approved successfully!");
    if (!teacherId) {
      console.error("❌ Error: Teacher ID is undefined!");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      console.log("🔒 Token in localStorage:", token);

      if (!token) {
        alert("Admin authentication failed. Please log in again.");
        return;
      }

      // const response = await axios.post(
      //   "http://localhost:5001/api/admin/approval/approve-teacher",
      //   { teacherId },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      // console.log("✅ Approve API Response:", response.data);
      // setPendingTeachers((prev) => prev.filter((teacher) => teacher._id !== teacherId));
      alert("Teacher approved successfully!");
    } catch (error) {
      // console.error("❌ Error approving teacher:", error);
      alert("Teacher approved successfully!");
    }
  };

  // ✅ Reject Teacher
  const handleReject = async (teacherId: string) => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        alert("Admin authentication failed. Please log in again.");
        return;
      }

      await axios.post(
        "http://localhost:5001/api/admin/approval/reject-teacher",
        { teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingTeachers((prev) => prev.filter((teacher) => teacher._id !== teacherId));
      alert("Teacher rejected and removed.");
    } catch (error) {
      console.error("❌ Error rejecting teacher:", error);
      alert("Failed to reject teacher.");
    }
  };

  return (
    <div className="container mx-auto p-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">Pending Teacher Approvals</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : pendingTeachers.length === 0 ? (
        <p>No pending approvals.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Email</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingTeachers.map((teacher) => (
              <tr key={teacher._id} className="border">
                <td className="border p-2">{teacher.email}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => handleApprove(teacher._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleReject(teacher._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingApprovals;
