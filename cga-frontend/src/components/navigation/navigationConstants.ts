import { Toolbar, MenuItem } from '@/types/navigation/types';


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

const authenticatedMenuItems: MenuItem[] = [
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

const unauthenticatedMenuItems: MenuItem[] = [
  {
    label: 'try it out',
    icon: 'pi pi-code',
    to: 'demo'
  }
];

export {
  authenticatedMenuItems,
  unauthenticatedMenuItems
};

