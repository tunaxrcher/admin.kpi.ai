import { ADMIN, USER } from '../../constants/roles.constant'
import type { Routes } from '../../@types/routes'

const homeRoute: Routes = {
    '/home': {
        key: 'home',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
}

export default homeRoute
