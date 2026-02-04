import { MenuLayoutBase } from "@/components/menu/MenuLayoutBase";
import { MenuDynamicContent } from "@/components/menu/MenuDynamicContent";

/**
 * Index Page - Public Menu
 * 
 * Architecture:
 * - MenuLayoutBase: Static shell (header, background, footer) - ALWAYS mounted immediately
 * - MenuDynamicContent: Data-dependent content - loads asynchronously without blocking first paint
 * 
 * This separation ensures:
 * 1. First paint happens immediately with background image visible
 * 2. Search/filter operations never unmount the static layout
 * 3. Data loading is non-blocking and uses stale-while-revalidate pattern
 */
const Index = () => {
  return (
    <MenuLayoutBase>
      <MenuDynamicContent />
    </MenuLayoutBase>
  );
};

export default Index;
