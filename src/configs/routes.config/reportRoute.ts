import { ADMIN, USER } from '../../constants/roles.constant'
import type { Routes } from '../../@types/routes'

const reportRoute: Routes = {
  '/management/reports': {
    key: 'reports.rewards',
    authority: [ADMIN, USER],
    meta: {
      pageContainerType: 'contained',
    },
  },
}

export default reportRoute
