
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useAuth } from "@/hooks/useAuth";

export function AvatarUploadTab() {
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const { uploadAvatar, uploading } = useAvatarUpload();
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.id) {
      uploadAvatar(file, user.id);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && user?.id) {
      uploadAvatar(file, user.id);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Avatar do Perfil</h3>
        <p className="text-gray-600">
          Faça upload de uma foto para personalizar seu perfil
        </p>
      </div>

      <div className="flex justify-center">
        <Avatar className="h-32 w-32 border-4 border-gray-200">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
            {profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      <Card
        className={`border-2 border-dashed transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium">Arraste uma imagem aqui</p>
              <p className="text-gray-500">ou clique no botão abaixo</p>
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
                disabled={uploading}
              />
              <label htmlFor="avatar-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Escolher Arquivo
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>

            <p className="text-sm text-gray-400">
              Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
