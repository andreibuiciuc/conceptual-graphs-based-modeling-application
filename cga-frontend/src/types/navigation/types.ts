interface NavigationItem {
    title: string,
    pathTo: string,
    subtitle?: string,
    avatar?: string,
    key?: string,
    value?: string,
    icon?: string,
    active?: boolean
};
  
interface Toolbar {
    navigationHeader: NavigationItem,
    navigationItems: NavigationItem[]
};
  
interface MenuItem {
    label: string,
    icon: string,
    to: string
};

export {
    NavigationItem,
    Toolbar,
    MenuItem
};