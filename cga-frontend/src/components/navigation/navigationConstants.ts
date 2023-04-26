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

const toolbar: Toolbar = {
  navigationHeader: {
    title: "CGA",
    subtitle: "Cassandra",
    avatar: "/cassandra.png",
    pathTo: "home",
  },
  navigationItems: [
    {
      key: "dataStructure",
      title: "data structure design",
      value: "dataStructure",
      icon: "mdi-family-tree",
      pathTo: "data-structure",
      active: false,
    },
    {
      key: "query",
      title: "query design",
      value: "query",
      icon: "mdi-database-search",
      pathTo: "query",
      active: false,
    },
  ]
};

const menuItems: MenuItem[] = [
  {
    label: 'console',
    icon: 'pi pi-home',
    to: 'home'
  },
  {
    label: 'data structure design',
    icon: 'pi pi-file-edit',
    to: 'data-structure'
  },
  {
    label: 'query design',
    icon: 'pi pi-database',
    to: 'query'
  }
]; 

export {
  NavigationItem,
  Toolbar,
  toolbar,
  menuItems
};

