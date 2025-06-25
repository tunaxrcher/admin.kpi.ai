import {
  NAV_ITEM_TYPE_TITLE,
  NAV_ITEM_TYPE_ITEM,
} from '../../constants/navigation.constant'

import type { NavigationTree } from '../../@types/navigation'

const navigationConfig: NavigationTree[] = [
  {
    key: 'home',
    path: '/ai',
    title: 'Home',
    translateKey: 'nav.home',
    icon: 'ai',
    type: NAV_ITEM_TYPE_ITEM,
    authority: [],
    subMenu: [],
  },
  {
    key: 'management',
    path: '',
    title: 'จัดการ',
    translateKey: 'nav.management',
    icon: 'groupMenu',
    type: NAV_ITEM_TYPE_TITLE,
    authority: [],
    subMenu: [
      {
        key: 'management.jobs',
        path: '/management/jobs',
        title: 'อาชีพ',
        translateKey: 'nav.management.jobs',
        icon: 'concepts',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
      },
    ],
  },
  {
    key: 'reports',
    path: '',
    title: 'Report',
    translateKey: 'nav.reports',
    icon: 'groupMenu',
    type: NAV_ITEM_TYPE_TITLE,
    authority: [],
    subMenu: [
      {
        key: 'reports.rewards',
        path: '',
        title: 'รางวัล (In Dev)',
        translateKey: 'nav.report.rewards',
        icon: 'sharedComponentDoc',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
      },
      {
        key: 'reports.employee',
        path: '',
        title: 'บุคคลากร (In Dev)',
        translateKey: 'nav.reports.employee',
        icon: 'utilsDoc',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
      },
    ],
  },
]

export default navigationConfig
