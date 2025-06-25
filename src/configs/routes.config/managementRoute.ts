import { ADMIN, USER } from '../../constants/roles.constant'
import type { Routes } from '../../@types/routes'

const managementRoute: Routes = {
    '/management/jobs': {
        key: 'management.jobs',
        authority: [ADMIN, USER],
    },
}

export default managementRoute
