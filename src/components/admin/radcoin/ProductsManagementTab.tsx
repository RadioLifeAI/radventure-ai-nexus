
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Gift, 
  Zap, 
  Target,
  Star,
  Percent
} from "lucide-react";
import { useRadCoinStore } from "@/components/radcoin-shop/hooks/useRadCoinStore";
import { useProductMutations } from "./hooks/useProductMutations";
import { ProductEditor } from "./ProductEditor";

export function ProductsManagementTab() {
  const { products, isLoadingProducts } = useRadCoinStore();
  const { createProduct, updateProduct, deleteProduct, isLoading: isMutating } = useProductMutations();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsEditorOpen(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsEditorOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(productId);
    }
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      // Update existing product
      updateProduct({
        id: editingProduct.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: 'help_package',
        benefits: productData.benefits,
        is_popular: productData.popular,
        discount_percentage: productData.discount,
        is_active: productData.isActive,
        sort_order: 0
      });
    } else {
      // Create new product
      createProduct({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: 'help_package',
        benefits: productData.benefits,
        is_popular: productData.popular,
        discount_percentage: productData.discount,
        is_active: productData.isActive,
        sort_order: products.length
      });
    }
    setIsEditorOpen(false);
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'basic': return <Gift className="h-5 w-5 text-blue-500" />;
      case 'advanced': return <Zap className="h-5 w-5 text-purple-500" />;
      case 'premium': return <Star className="h-5 w-5 text-yellow-500" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (product: any) => {
    if (product.is_popular) {
      return <Badge className="bg-purple-500 text-white">Popular</Badge>;
    }
    if (product.discount_percentage > 0) {
      return <Badge className="bg-orange-500 text-white">-{product.discount_percentage}%</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Ativo</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h2>
          <p className="text-gray-600">Controle completo sobre os pacotes da loja</p>
        </div>
        <Button 
          onClick={handleCreateProduct}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Lista de Produtos */}
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getProductIcon(product.category)}
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </div>
                  {getStatusBadge(product)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{product.description}</p>
              
              {/* Preço */}
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-blue-600">
                  {product.price} RC
                </div>
                {product.discount_percentage > 0 && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Percent className="h-4 w-4" />
                    <span className="text-sm font-medium">-{product.discount_percentage}%</span>
                  </div>
                )}
              </div>

              {/* Benefícios */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Benefícios:</h4>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-red-500" />
                    <span>{product.benefits.elimination_aids} Eliminações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-blue-500" />
                    <span>{product.benefits.skip_aids} Pular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="h-3 w-3 text-purple-500" />
                    <span>{product.benefits.ai_tutor_credits} Tutor IA</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditProduct(product)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={isMutating}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Estatísticas dos Produtos */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Estatísticas dos Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-sm text-gray-600">Total de Produtos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {products.filter(p => p.is_popular).length}
              </div>
              <div className="text-sm text-gray-600">Produtos Populares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {products.filter(p => p.discount_percentage > 0).length}
              </div>
              <div className="text-sm text-gray-600">Com Desconto</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.length > 0 ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length) : 0}
              </div>
              <div className="text-sm text-gray-600">Preço Médio (RC)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor de Produto */}
      <ProductEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
        isLoading={isMutating}
      />
    </div>
  );
}
