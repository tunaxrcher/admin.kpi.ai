import {
  NAV_ITEM_TYPE_TITLE,
  NAV_ITEM_TYPE_ITEM,
} from '../../constants/navigation.constant'

import type { NavigationTree } from '../../@types/navigation'

const navigationConfig: NavigationTree[] = [
  {
    key: 'ai',
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
      {
        key: 'management.characters',
        path: '/management/characters',
        title: 'บุคลากร',
        translateKey: 'nav.management.characters',
        icon: 'utilsDoc',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
      },
    ],
  },
  {
    key: 'reports',
    path: '',
    title: 'รายงาน',
    translateKey: 'nav.reports',
    icon: 'groupMenu',
    type: NAV_ITEM_TYPE_TITLE,
    authority: [],
    subMenu: [
      {
        key: 'reports.rewards',
        path: '/management/reports',
        title: 'รางวัล',
        translateKey: 'nav.report.rewards',
        icon: 'sharedComponentDoc',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
      },
    ],
  },
]

export default navigationConfig
