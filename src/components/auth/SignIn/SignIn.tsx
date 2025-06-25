'use client'

// import Logo from '../../template/Logo'
import Alert from '../../ui/Alert'
import SignInForm from './SignInForm'

import ActionLink from '../../shared/ActionLink'
import useTimeOutMessage from '../../../utils/hooks/useTimeOutMessage'
// import useTheme from '../../../utils/hooks/useTheme'
import type { OnSignIn } from './SignInForm'
import type { OnOauthSignIn } from './OauthSignIn'

type SignInProps = {
    signUpUrl?: string
    forgetPasswordUrl?: string
    onSignIn?: OnSignIn
    onOauthSignIn?: OnOauthSignIn
}

const SignIn = ({
    forgetPasswordUrl = '/forgot-password',
    onSignIn,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()

    // const mode = useTheme((state) => state.mode)

    return (
        <>
            <div className="mb-8">
                {/* <Logo
                    type="streamline"
                    mode={mode}
                    logoWidth={60}
                    logoHeight={60}
                /> */}
            </div>
            <div className="mb-10">
                <h2 className="mb-2">ระบบจัดการ KPI AI</h2>
                <p className="font-semibold heading-text">
                    Please enter your credentials to sign in!
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignInForm
                setMessage={setMessage}
                passwordHint={
                    <div className="mb-7 mt-2">
                        <ActionLink
                            href={forgetPasswordUrl}
                            className="font-semibold heading-text mt-2 underline"
                            themeColor={false}
                        >
                            Forgot password
                        </ActionLink>
                    </div>
                }
                onSignIn={onSignIn}
            />
        </>
    )
}

export default SignIn
