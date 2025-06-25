import aiRoute from './aiRoute'
import authRoute from './authRoute'
import type { Routes } from '../../@types/routes'
import homeRoute from './homeRoute'
import managementRoute from './managementRoute'
import reportRoute from './reportRoute'

export const protectedRoutes: Routes = {
    ...homeRoute,
    ...managementRoute,
    ...reportRoute,
    ...aiRoute,
}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute
