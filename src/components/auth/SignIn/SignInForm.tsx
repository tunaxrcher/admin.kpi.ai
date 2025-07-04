'use client'

import { useState } from 'react'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import { FormItem, Form } from '../../ui/Form'
import PasswordInput from '../../shared/PasswordInput'
import classNames from '../../../utils/classNames'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '../../../@types/common'
import type { ReactNode } from 'react'

export type OnSignInPayload = {
  values: SignInFormSchema
  setSubmitting: (isSubmitting: boolean) => void
  setMessage: (message: string) => void
}

export type OnSignIn = (payload: OnSignInPayload) => void

interface SignInFormProps extends CommonProps {
  passwordHint?: string | ReactNode
  setMessage: (message: string) => void
  onSignIn?: OnSignIn
}

type SignInFormSchema = {
  email: string
  password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
  email: z
    .string({ required_error: 'Please enter your email' })
    .min(1, { message: 'Please enter your email' }),
  password: z
    .string({ required_error: 'Please enter your password' })
    .min(1, { message: 'Please enter your password' }),
})

const SignInForm = (props: SignInFormProps) => {
  const [isSubmitting, setSubmitting] = useState<boolean>(false)

  const { className, setMessage, onSignIn, passwordHint } = props

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SignInFormSchema>({
    defaultValues: {
      email: 'admin-01@mail.com',
      password: '123Qwe',
    },
    resolver: zodResolver(validationSchema),
  })

  const handleSignIn = async (values: SignInFormSchema) => {
    if (onSignIn) {
      onSignIn({ values, setSubmitting, setMessage })
    }
  }

  return (
    <div className={className}>
      <Form onSubmit={handleSubmit(handleSignIn)}>
        <FormItem
          label="ยูสเซอร์เนม"
          invalid={Boolean(errors.email)}
          errorMessage={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                type="email"
                placeholder="Email"
                autoComplete="off"
                {...field}
              />
            )}
          />
        </FormItem>
        <FormItem
          label="พาสเวิร์ด"
          invalid={Boolean(errors.password)}
          errorMessage={errors.password?.message}
          className={classNames(
            passwordHint ? 'mb-0' : '',
            errors.password?.message ? 'mb-8' : '',
          )}
        >
          <Controller
            name="password"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <PasswordInput
                type="text"
                placeholder="Password"
                autoComplete="off"
                {...field}
              />
            )}
          />
        </FormItem>
        {passwordHint}
        <Button block loading={isSubmitting} variant="solid" type="submit">
          {isSubmitting ? 'กำลัง...' : 'เข้าสู่ระบบ'}
        </Button>
      </Form>
    </div>
  )
}

export default SignInForm
