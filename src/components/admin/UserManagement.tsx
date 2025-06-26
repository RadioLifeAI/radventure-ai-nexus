
import React, { useState } from "react";
import { UserStatsCards } from "./users/UserStatsCards";
import { UserManagementHeader } from "./users/UserManagementHeader";
import { UserManagementTabs } from "./users/UserManagementTabs";
import { UserEditModal } from "./users/UserEditModal";
import { useRealUsers } from "@/hooks/useRealUsers";
import type { UserProfile } from "@/types/admin";

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "USER" | "ADMIN">("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { 
    users, 
    isLoading, 
    refetch, 
    updateUser, 
    promoteUser, 
    demoteUser, 
    isUpdating 
  } = useRealUsers();

  // Filter users based on search and type
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || user.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handlePromoteUser = (userId: string) => {
    promoteUser(userId);
  };

  const handleDemoteUser = (userId: string) => {
    demoteUser(userId);
  };

  const handleUserUpdated = () => {
    refetch();
    setIsEditModalOpen(false);
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(user => 
    user.updated_at && new Date(user.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  const adminUsers = users.filter(user => user.type === "ADMIN").length;

  return (
    <div className="space-y-6">
      <UserManagementHeader 
        totalUsers={totalUsers}
        activeUsers={activeUsers} 
        adminUsers={adminUsers}
      />

      <UserStatsCards 
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        adminUsers={adminUsers}
      />

      <UserManagementTabs
        users={filteredUsers}
        isLoading={isLoading || isUpdating}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        onEditUser={handleEditUser}
        onBanUser={handleDemoteUser}
        onPromoteUser={handlePromoteUser}
      />

      <UserEditModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
