import { ADMIN, USER } from '../../constants/roles.constant'
import type { Routes } from '../../@types/routes'

const aiRoute: Routes = {
  '/ai': {
    key: 'ai',
    authority: [ADMIN, USER],
    meta: {
      pageContainerType: 'contained',
    },
  },
}

export default aiRoute
