create index if not exists idx_menu_visible on menu_items (visible);
create index if not exists idx_menu_sort on menu_items (sort_order);
create index if not exists idx_menu_category on menu_items (category);
