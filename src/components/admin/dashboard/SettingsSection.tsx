import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function SettingsSection() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    address: "BR-104, Km 118, Lagoa Seca – PB",
    instagram: "https://instagram.com/SEU_PERFIL",
    whatsapp: "https://wa.me/55XXXXXXXXXXX",
  });

  const handleSave = () => {
    toast({
      title: "Sucesso!",
      description: "Configurações atualizadas com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Atualize as informações gerais do cardápio
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 space-y-6">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logomarca</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Clique para fazer upload da logo
            </p>
          </div>
        </div>

        {/* Background Image Upload */}
        <div className="space-y-2">
          <Label>Imagem de Fundo</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Clique para fazer upload da imagem de fundo
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            placeholder="Endereço completo"
          />
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={settings.instagram}
            onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
            placeholder="URL do Instagram"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={settings.whatsapp}
            onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
            placeholder="URL do WhatsApp"
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
