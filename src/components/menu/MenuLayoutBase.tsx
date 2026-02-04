import { ReactNode } from "react";
import { MenuHeader } from "@/components/MenuHeader";
import { MenuFooter } from "@/components/MenuFooter";

interface MenuLayoutBaseProps {
  children: ReactNode;
}

/**
 * MenuLayoutBase - Static shell that is ALWAYS mounted immediately.
 * This component renders the header (with background image), and footer
 * independently of any data loading state.
 * 
 * The children (dynamic content) can change without unmounting this layout.
 */
export const MenuLayoutBase = ({ children }: MenuLayoutBaseProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Phase 1: Static UI - Always render immediately */}
      <MenuHeader />
      
      {/* Dynamic content area - can change without unmounting header/footer */}
      {children}
      
      <MenuFooter />
    </div>
  );
};
