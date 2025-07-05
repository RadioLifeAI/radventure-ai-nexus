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
import { 
  Settings, 
  User, 
  Camera, 
  Shield, 
  Loader2,
  Coins
} from "lucide-react";
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
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-background via-muted/20 to-background border-primary/20">
        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-primary/20">
          <DialogTitle className="flex items-center gap-3 text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent font-semibold">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            Gerenciar Conta
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="profile" className="h-full">
            <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-muted/50 via-card to-muted/50 mx-6 mt-4 border border-primary/20">
              <TabsTrigger value="profile" className="flex items-center gap-2 hover:bg-primary/10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all duration-300">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="avatar" className="flex items-center gap-2 hover:bg-secondary/10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-secondary-foreground transition-all duration-300">
                <Camera className="h-4 w-4" />
                Avatar
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 hover:bg-accent/10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground transition-all duration-300">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="radcoin-shop" className="flex items-center gap-2 hover:bg-primary/10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all duration-300">
                <Coins className="h-4 w-4" />
                Loja RadCoin
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 hover:bg-secondary/10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-secondary-foreground transition-all duration-300">
                <Settings className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
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
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
