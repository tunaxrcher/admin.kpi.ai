import classNames from 'classnames'
import { APP_NAME } from '../../constants/app.constant'
import Image from 'next/image'
import type { CommonProps } from '../../@types/common'
import { getLogoSrc } from '../../lib/logo'

interface LogoProps extends CommonProps {
  type?: 'full' | 'streamline'
  mode?: 'light' | 'dark'
  imgClass?: string
  logoWidth?: number
  logoHeight?: number
}

const Logo = (props: LogoProps) => {
  const {
    type = 'full',
    mode = 'light',
    className,
    imgClass,
    style,
    logoWidth,
    logoHeight,
  } = props

  const width = logoWidth || (type === 'full' ? 120 : 40)
  const height = logoHeight || (type === 'full' ? 40 : 40)

  return (
    <div className={classNames('logo', className)} style={style}>
      {mode === 'light' && (
        <>
          <Image
            className={classNames(
              '',
              type === 'full' ? '' : 'hidden',
              imgClass,
            )}
            src={getLogoSrc('light', 'full')}
            alt={`${APP_NAME} logo`}
            width={width}
            height={height}
            priority
          />
          <Image
            className={classNames(
              '',
              type === 'streamline' ? '' : 'hidden',
              imgClass,
            )}
            src={getLogoSrc('light', 'streamline')}
            alt={`${APP_NAME} logo`}
            width={width}
            height={height}
            priority
          />
        </>
      )}
      {mode === 'dark' && (
        <>
          <Image
            className={classNames(type === 'full' ? '' : 'hidden', imgClass)}
            src={getLogoSrc('dark', 'full')}
            alt={`${APP_NAME} logo`}
            width={width}
            height={height}
            priority
          />
          <Image
            className={classNames(
              type === 'streamline' ? '' : 'hidden',
              imgClass,
            )}
            src={getLogoSrc('dark', 'streamline')}
            alt={`${APP_NAME} logo`}
            width={width}
            height={height}
            priority
          />
        </>
      )}
    </div>
  )
}

export default Logo
