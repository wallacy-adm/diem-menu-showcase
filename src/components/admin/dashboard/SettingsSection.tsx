import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

export function SettingsSection() {
  const { toast } = useToast();
  const { settings, isLoading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    brand_name: "",
    tagline: "",
    address: "",
    instagram_url: "",
    whatsapp_url: "",
    footer_note: "",
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bgPreview, setBgPreview] = useState<string>("");

  useEffect(() => {
    if (settings) {
      setFormData({
        brand_name: settings.brand_name,
        tagline: settings.tagline,
        address: settings.address,
        instagram_url: settings.instagram_url,
        whatsapp_url: settings.whatsapp_url,
        footer_note: settings.footer_note,
      });
    }
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setBgPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      toast({
        title: "✅ Salvo!",
        description: "Configurações atualizadas com sucesso. As mudanças serão refletidas no cardápio.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Atualize as informações gerais do cardápio
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 space-y-6">
        {/* Brand Name */}
        <div className="space-y-2">
          <Label htmlFor="brand_name">Nome da Marca</Label>
          <Input
            id="brand_name"
            value={formData.brand_name}
            onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
            placeholder="Nome do estabelecimento"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline">Slogan</Label>
          <Input
            id="tagline"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="Slogan do estabelecimento"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logomarca</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <label 
                htmlFor="logo-upload"
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload da logo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Máx. 2MB - PNG, JPG, WEBP
                </p>
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            {logoPreview && (
              <div className="w-32 h-32 border border-border rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Background Image Upload */}
        <div className="space-y-2">
          <Label>Imagem de Fundo</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <label 
                htmlFor="bg-upload"
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center"
              >
                <ImageIcon className="w-6 h-6 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload da imagem de fundo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Máx. 2MB - PNG, JPG, WEBP
                </p>
              </label>
              <input
                id="bg-upload"
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                className="hidden"
              />
            </div>
            {bgPreview && (
              <div className="w-32 h-32 border border-border rounded-lg overflow-hidden bg-muted">
                <img src={bgPreview} alt="Background preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Endereço completo"
          />
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram_url}
            onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
            placeholder="https://instagram.com/seu_perfil"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp_url}
            onChange={(e) => setFormData({ ...formData, whatsapp_url: e.target.value })}
            placeholder="https://wa.me/5511999999999"
          />
        </div>

        {/* Footer Note */}
        <div className="space-y-2">
          <Label htmlFor="footer_note">Nota de Rodapé</Label>
          <Textarea
            id="footer_note"
            value={formData.footer_note}
            onChange={(e) => setFormData({ ...formData, footer_note: e.target.value })}
            placeholder="Texto que aparece no rodapé do cardápio"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
