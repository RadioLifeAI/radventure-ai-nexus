import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useNavigate } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";
import { 
  Settings, 
  User, 
  Camera, 
  Shield, 
  Loader2,
  Coins,
  Menu
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileEditTab } from "./ProfileEditTab";
import { AvatarUploadTab } from "./AvatarUploadTab";
import { SecurityTab } from "./SecurityTab";
import { RadCoinShopTab } from "./RadCoinShopTab";
import { HistoryAnalyticsTab } from "../radcoin-shop/tabs/HistoryAnalyticsTab";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { profile, updateProfile, isUpdating } = useUserProfile();
  const { isAdmin } = useAdminAccess();
  const navigate = useNavigate();
  const { isMobile, isTablet, getModalSize, getTabsLayout } = useResponsive();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    city: '',
    state: '',
    medical_specialty: '',
    academic_specialty: '',
    academic_stage: 'Student' as 'Student' | 'Intern' | 'Resident' | 'Specialist',
    college: '',
    birthdate: ''
  });

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        city: profile.city || '',
        state: profile.state || '',
        medical_specialty: profile.medical_specialty || '',
        academic_specialty: profile.academic_specialty || '',
        academic_stage: (profile.academic_stage as 'Student' | 'Intern' | 'Resident' | 'Specialist') || 'Student',
        college: profile.college || '',
        birthdate: profile.birthdate || ''
      });
    }
  }, [profile, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getModalSize()} p-0 bg-background border-border max-h-[85vh] sm:max-h-[90vh]`}>
        <DialogHeader className={`px-4 sm:px-6 py-3 sm:py-4 bg-muted border-b border-border`}>
          <DialogTitle className={`flex items-center gap-2 sm:gap-3 ${isMobile ? 'text-lg' : 'text-2xl'} text-foreground font-semibold`}>
            <div className="p-1.5 sm:p-2 bg-primary rounded-lg">
              <Settings className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-primary-foreground`} />
            </div>
            {isMobile ? 'Conta' : 'Gerenciar Conta'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="h-full flex flex-col">
          {/* Abas fixas fora do ScrollArea */}
          <div className="flex-shrink-0 px-2 sm:px-6 mt-2 sm:mt-4">
            <TabsList className={`w-full bg-muted border border-border ${
              isMobile 
                ? 'grid grid-rows-2 grid-cols-3 gap-1 p-1 h-20' 
                : isTablet 
                  ? 'grid grid-rows-2 grid-cols-3 gap-1 p-1 h-16' 
                  : 'grid grid-cols-5 gap-1 p-1 h-10'
            }`}>
              <TabsTrigger 
                value="profile" 
                className={`flex items-center justify-center ${isMobile ? 'flex-col gap-1 px-1 py-2' : isTablet ? 'gap-1 px-2' : 'gap-2 px-3'} hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm`}
              >
                <User className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} flex-shrink-0`} />
                {!isMobile && <span className={`${isTablet ? 'text-xs' : 'text-sm'} truncate`}>
                  {isTablet ? 'Perfil' : 'Perfil'}
                </span>}
              </TabsTrigger>
              <TabsTrigger 
                value="avatar" 
                className={`flex items-center justify-center ${isMobile ? 'flex-col gap-1 px-1 py-2' : isTablet ? 'gap-1 px-2' : 'gap-2 px-3'} hover:bg-secondary/10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-sm`}
              >
                <Camera className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} flex-shrink-0`} />
                {!isMobile && <span className={`${isTablet ? 'text-xs' : 'text-sm'} truncate`}>
                  {isTablet ? 'Avatar' : 'Avatar'}
                </span>}
              </TabsTrigger>
              <TabsTrigger 
                value="radcoin-shop" 
                className={`flex items-center justify-center ${isMobile ? 'flex-col gap-1 px-1 py-2' : isTablet ? 'gap-1 px-2' : 'gap-2 px-3'} hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm`}
              >
                <Coins className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} flex-shrink-0`} />
                {!isMobile && <span className={`${isTablet ? 'text-xs' : 'text-sm'} truncate`}>
                  {isTablet ? 'Loja' : 'Loja'}
                </span>}
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className={`flex items-center justify-center ${isMobile ? 'flex-col gap-1 px-1 py-2' : isTablet ? 'gap-1 px-2' : 'gap-2 px-3'} hover:bg-secondary/10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-sm`}
              >
                <Settings className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} flex-shrink-0`} />
                {!isMobile && <span className={`${isTablet ? 'text-xs' : 'text-sm'} truncate`}>
                  {isTablet ? 'Hist' : 'Histórico'}
                </span>}
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className={`flex items-center justify-center ${isMobile ? 'flex-col gap-1 px-1 py-2' : isTablet ? 'gap-1 px-2' : 'gap-2 px-3'} hover:bg-accent/10 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-sm`}
              >
                <Shield className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} flex-shrink-0`} />
                {!isMobile && <span className={`${isTablet ? 'text-xs' : 'text-sm'} truncate`}>
                  {isTablet ? 'Seg' : 'Segurança'}
                </span>}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ScrollArea apenas para o conteúdo das abas */}
          <ScrollArea className="flex-1 max-h-[calc(85vh-180px)] sm:max-h-[calc(90vh-200px)]">
            <div className={`p-3 sm:p-6`}>
              <TabsContent value="profile" className="mt-0">
                <ProfileEditTab 
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  isUpdating={isUpdating}
                />
              </TabsContent>

              <TabsContent value="avatar" className="mt-0">
                <AvatarUploadTab />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityTab isAdmin={isAdmin} onNavigateToAdmin={() => navigate('/admin')} />
              </TabsContent>

              <TabsContent value="radcoin-shop" className="mt-0">
                <RadCoinShopTab />
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <HistoryAnalyticsTab />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
