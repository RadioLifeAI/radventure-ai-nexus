
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Edit3, 
  Settings, 
  BarChart3, 
  Upload,
  Download,
  Trash2,
  Copy,
  ZoomIn,
  Info,
  Layers,
  Sliders
} from 'lucide-react';

interface ImageData {
  id: string;
  url: string;
  legend: string;
  filename: string;
  size: number;
  dimensions: { width: number; height: number };
  format: string;
  uploadedAt: string;
}

interface ImageAdvancedModalsProps {
  image: ImageData;
  onUpdate: (image: ImageData) => void;
  onDelete: (id: string) => void;
}

export function ImageAdvancedModals({ image, onUpdate, onDelete }: ImageAdvancedModalsProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  return (
    <div className="flex gap-1">
      {/* Modal de Visualização Avançada */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ZoomIn className="h-5 w-5" />
              Visualização Avançada - {image.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.legend}
                  className="w-full h-auto max-h-96 object-contain"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant="secondary">
                    {image.dimensions.width} × {image.dimensions.height}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Arquivo:</strong> {image.filename}</div>
                  <div><strong>Formato:</strong> {image.format.toUpperCase()}</div>
                  <div><strong>Tamanho:</strong> {(image.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div><strong>Dimensões:</strong> {image.dimensions.width} × {image.dimensions.height}</div>
                  <div><strong>Upload:</strong> {new Date(image.uploadedAt).toLocaleDateString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Formatos Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Badge variant="outline">Original</Badge>
                    <Badge variant="outline">Large</Badge>
                    <Badge variant="outline">Medium</Badge>
                    <Badge variant="outline">Thumbnail</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Metadados */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit3 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Editar Metadados - {image.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legend">Legenda da Imagem</Label>
                <Textarea 
                  id="legend"
                  defaultValue={image.legend}
                  placeholder="Descreva o que é mostrado na imagem..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alt-text">Texto Alternativo (Alt)</Label>
                <Textarea 
                  id="alt-text"
                  placeholder="Texto para acessibilidade..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input 
                  id="tags"
                  placeholder="radiologia, tórax, pneumonia..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input 
                  id="category"
                  placeholder="Ex: Imagem Diagnóstica"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações de Processamento */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Configurações de Processamento
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="formats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="formats">Formatos</TabsTrigger>
              <TabsTrigger value="quality">Qualidade</TabsTrigger>
              <TabsTrigger value="operations">Operações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Formatos de Saída</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="webp" defaultChecked />
                      <label htmlFor="webp" className="text-sm">WebP (Recomendado)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="avif" />
                      <label htmlFor="avif" className="text-sm">AVIF (Moderno)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="jpeg" defaultChecked />
                      <label htmlFor="jpeg" className="text-sm">JPEG (Compatibilidade)</label>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tamanhos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Thumbnail:</span>
                      <Badge variant="outline">300×300</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medium:</span>
                      <Badge variant="outline">800×600</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Large:</span>
                      <Badge variant="outline">1200×900</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="quality" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Qualidade JPEG (0-100)</Label>
                  <Input type="number" defaultValue="85" min="0" max="100" />
                </div>
                <div>
                  <Label>Qualidade WebP (0-100)</Label>
                  <Input type="number" defaultValue="80" min="0" max="100" />
                </div>
                <div>
                  <Label>Compressão PNG</Label>
                  <Input type="number" defaultValue="6" min="0" max="9" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="operations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Download className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-semibold">Reprocessar Imagem</div>
                    <div className="text-xs text-gray-500">Aplicar novas configurações</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Copy className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-semibold">Duplicar Imagem</div>
                    <div className="text-xs text-gray-500">Criar cópia para edição</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-semibold">Substituir Arquivo</div>
                    <div className="text-xs text-gray-500">Upload nova versão</div>
                  </div>
                </Button>
                
                <Button variant="destructive" className="h-auto p-4">
                  <div className="text-center">
                    <Trash2 className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-semibold">Excluir Imagem</div>
                    <div className="text-xs text-gray-200">Ação irreversível</div>
                  </div>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de Analytics */}
      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics da Imagem
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estatísticas de Uso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Visualizações:</span>
                  <Badge>127</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Downloads:</span>
                  <Badge>23</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Casos que usam:</span>
                  <Badge>3</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tempo de carregamento:</span>
                  <Badge variant="outline">1.2s</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Compressão:</span>
                  <Badge variant="outline">68%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>CDN Hits:</span>
                  <Badge variant="outline">95%</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Histórico de Modificações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b">
                    <span>Upload inicial</span>
                    <span className="text-gray-500">2 dias atrás</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Metadados atualizados</span>
                    <span className="text-gray-500">1 dia atrás</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Reprocessamento WebP</span>
                    <span className="text-gray-500">4 horas atrás</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
