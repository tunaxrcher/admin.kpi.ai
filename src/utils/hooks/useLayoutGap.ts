'use client'

import useTheme from './useTheme'
import {
  HEADER_HEIGHT,
  LAYOUT_COLLAPSIBLE_SIDE,
  LAYOUT_FRAMELESS_SIDE,
} from '../../constants/theme.constant'

const useLayoutGap = () => {
  const layoutType = useTheme((state) => state.layout.type)

  const getTopGapValue = () => {
    switch (layoutType) {
      case LAYOUT_COLLAPSIBLE_SIDE:
        return HEADER_HEIGHT + 24
      case LAYOUT_FRAMELESS_SIDE:
        return HEADER_HEIGHT + 24
      default:
        return HEADER_HEIGHT + 24
    }
  }

  return {
    getTopGapValue,
  }
}

export default useLayoutGap
