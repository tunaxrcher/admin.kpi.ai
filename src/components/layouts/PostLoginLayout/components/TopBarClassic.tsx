'use client'

import Header from '../../../template/Header'
import UserProfileDropdown from '../../../template/UserProfileDropdown'
import HeaderLogo from '../../../template/HeaderLogo'
import MobileNav from '../../../template/MobileNav'
import HorizontalNav from '../../../template/HorizontalNav'
import LayoutBase from '../../../template/LayoutBase'
import { LAYOUT_TOP_BAR_CLASSIC } from '../../../../constants/theme.constant'
import type { CommonProps } from '../../../../@types/common'

const TopBarClassic = ({ children }: CommonProps) => {
    return (
        <LayoutBase
            type={LAYOUT_TOP_BAR_CLASSIC}
            className="app-layout-top-bar-classic flex flex-auto flex-col min-h-screen"
        >
            <div className="flex flex-auto min-w-0">
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        container
                        className="shadow-sm dark:shadow-2xl"
                        headerStart={
                            <>
                                <MobileNav />
                                <HeaderLogo />
                            </>
                        }
                        headerMiddle={<HorizontalNav />}
                        headerEnd={
                            <>
                                <UserProfileDropdown hoverable={false} />
                            </>
                        }
                    />
                    {children}
                </div>
            </div>
        </LayoutBase>
    )
}

export default TopBarClassic
