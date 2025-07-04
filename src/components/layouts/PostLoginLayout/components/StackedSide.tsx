'use client'

import StackedSideNav from '../../../template/StackedSideNav'
import Header from '../../../template/Header'
import MobileNav from '../../../template/MobileNav'
import UserProfileDropdown from '../../../template/UserProfileDropdown'
import LayoutBase from '../../../template/LayoutBase'
import { LAYOUT_STACKED_SIDE } from '../../../../constants/theme.constant'
import type { CommonProps } from '../../../../@types/common'

const StackedSide = ({ children }: CommonProps) => {
  return (
    <LayoutBase
      type={LAYOUT_STACKED_SIDE}
      className="app-layout-stacked-side flex flex-auto flex-col"
    >
      <div className="flex flex-auto min-w-0">
        <StackedSideNav />
        <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
          <Header
            className="shadow-sm dark:shadow-2xl"
            headerStart={<MobileNav />}
            headerEnd={
              <>
                <UserProfileDropdown hoverable={false} />
              </>
            }
          />
          <div className="h-full flex flex-auto flex-col">{children}</div>
        </div>
      </div>
    </LayoutBase>
  )
}

export default StackedSide
