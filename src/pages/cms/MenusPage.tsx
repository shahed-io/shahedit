import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronRight } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import { useCmsMenus, useMenuItems, useSaveMenu, useDeleteMenu, useSaveMenuItem, useDeleteMenuItem } from '@/hooks/useCms';
import { useToast } from '@/components/ui/use-toast';

export default function MenusPage() {
  const { data: menus = [] } = useCmsMenus();
  const saveMenu = useSaveMenu();
  const deleteMenu = useDeleteMenu();
  const { toast } = useToast();

  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [menuName, setMenuName] = useState('');
  const [menuLocation, setMenuLocation] = useState<string>('header');

  const selectedMenu = menus.find(m => m.id === selectedMenuId);

  const handleCreateMenu = async () => {
    if (!menuName.trim()) return;
    try {
      await saveMenu.mutateAsync({ name: menuName, location: menuLocation });
      setMenuName('');
      toast({ title: 'Menu created!' });
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Delete menu?')) return;
    try { await deleteMenu.mutateAsync(id); setSelectedMenuId(''); toast({ title: 'Deleted' }); }
    catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  return (
    <CmsLayout title="Menus">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Menu List */}
        <div className="space-y-4">
          {/* Create */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Create Menu</h3>
            <input value={menuName} onChange={e => setMenuName(e.target.value)} placeholder="Menu name"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
            <select value={menuLocation} onChange={e => setMenuLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
              <option value="header">Header</option>
              <option value="footer">Footer</option>
            </select>
            <button onClick={handleCreateMenu} className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition">
              Create Menu
            </button>
          </div>

          {/* Existing Menus */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <p className="text-sm font-semibold text-white">Existing Menus</p>
            </div>
            {menus.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-sm">No menus yet</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {menus.map(menu => (
                  <div key={menu.id} className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/50 transition ${selectedMenuId === menu.id ? 'bg-slate-800/70' : ''}`}
                    onClick={() => setSelectedMenuId(menu.id)}>
                    <div>
                      <p className="text-sm text-white font-medium">{menu.name}</p>
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded capitalize">{menu.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedMenuId === menu.id && <ChevronRight className="w-4 h-4 text-violet-400" />}
                      <button onClick={e => { e.stopPropagation(); handleDeleteMenu(menu.id); }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Menu Items */}
        <div className="md:col-span-2">
          {selectedMenu ? (
            <MenuItemsEditor menuId={selectedMenu.id} menuName={selectedMenu.name} />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center h-64">
              <p className="text-slate-500 text-sm">Select a menu to edit its items</p>
            </div>
          )}
        </div>
      </div>
    </CmsLayout>
  );
}

function MenuItemsEditor({ menuId, menuName }: { menuId: string; menuName: string }) {
  const { data: items = [] } = useMenuItems(menuId);
  const saveItem = useSaveMenuItem();
  const deleteItem = useDeleteMenuItem();
  const { toast } = useToast();

  const [label, setLabel] = useState('');
  const [itemType, setItemType] = useState('url');
  const [target, setTarget] = useState('');

  const handleAdd = async () => {
    if (!label.trim()) return;
    try {
      await saveItem.mutateAsync({ menu_id: menuId, label, item_type: itemType, target, sort_order: items.length });
      setLabel(''); setTarget('');
      toast({ title: 'Item added!' });
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteItem.mutateAsync({ id, menuId }); }
    catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl">
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-white">"{menuName}" Items</h3>
      </div>

      {/* Add Item Form */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <h4 className="text-xs font-medium text-slate-400">Add Menu Item</h4>
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label"
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
          <select value={itemType} onChange={e => setItemType(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
            <option value="url">Custom URL</option>
            <option value="content">Content Page</option>
            <option value="term">Category/Tag</option>
          </select>
          <input value={target} onChange={e => setTarget(e.target.value)} placeholder={itemType === 'url' ? 'https://...' : 'ID or slug'}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Items List */}
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-sm">No items yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                <div className="flex-1">
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.item_type} → {item.target || '(no target)'}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
