'use server'
import type { SignInCredential } from '../../../@types/auth'

const validateCredential = async (values: SignInCredential) => {
  const { email, password } = values

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (email === adminEmail && password === adminPassword) {
    return {
      id: '21',
      avatar: '',
      userName: 'Admin',
      email: adminEmail,
      authority: ['admin', 'user'],
      accountUserName: 'admin',
    }
  }

  return undefined
}

export default validateCredential
