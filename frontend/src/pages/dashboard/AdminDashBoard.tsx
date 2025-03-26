import React from "react";
import PendingApprovals from "../../pages/utils/PendingApprovals";

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl text-center mt-[40px] font-bold mb-6">Admin Dashboard</h1>
      <PendingApprovals />
    </div>
  );
};

export default AdminDashboard;
