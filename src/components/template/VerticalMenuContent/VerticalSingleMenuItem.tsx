import Tooltip from '../../ui/Tooltip'
import Menu from '../../ui/Menu'
import AuthorityCheck from '../../shared/AuthorityCheck'
import VerticalMenuIcon from './VerticalMenuIcon'
import Link from 'next/link'
import Dropdown from '../../ui/Dropdown'
import type { CommonProps } from '../../../@types/common'
import type { Direction } from '../../../@types/theme'
import type { NavigationTree, TranslationFn } from '../../../@types/navigation'

const { MenuItem } = Menu

interface CollapsedItemProps extends CommonProps {
  nav: NavigationTree
  direction?: Direction
  onLinkClick?: (link: { key: string; title: string; path: string }) => void
  t: TranslationFn
  renderAsIcon?: boolean
  userAuthority: string[]
  currentKey?: string
  parentKeys?: string[]
}

interface DefaultItemProps {
  nav: NavigationTree
  onLinkClick?: (link: { key: string; title: string; path: string }) => void
  sideCollapsed?: boolean
  t: TranslationFn
  indent?: boolean
  userAuthority: string[]
  showIcon?: boolean
  showTitle?: boolean
}

interface VerticalMenuItemProps extends CollapsedItemProps, DefaultItemProps {}

const CollapsedItem = ({
  nav,
  children,
  direction,
  renderAsIcon,
  onLinkClick,
  userAuthority,
  t,
  currentKey,
}: CollapsedItemProps) => {
  return (
    <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
      {renderAsIcon ? (
        <Tooltip
          title={t(nav.translateKey, nav.title)}
          placement={direction === 'rtl' ? 'left' : 'right'}
        >
          {children}
        </Tooltip>
      ) : (
        <Dropdown.Item active={currentKey === nav.key}>
          {nav.path ? (
            <Link
              className="h-full w-full flex items-center outline-hidden"
              href={nav.path}
              target={nav.isExternalLink ? '_blank' : ''}
              onClick={() =>
                onLinkClick?.({
                  key: nav.key,
                  title: nav.title,
                  path: nav.path,
                })
              }
            >
              <span>{t(nav.translateKey, nav.title)}</span>
            </Link>
          ) : (
            <span>{t(nav.translateKey, nav.title)}</span>
          )}
        </Dropdown.Item>
      )}
    </AuthorityCheck>
  )
}

const DefaultItem = (props: DefaultItemProps) => {
  const {
    nav,
    onLinkClick,
    showTitle,
    indent,
    showIcon = true,
    userAuthority,
    t,
  } = props

  return (
    <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
      <MenuItem key={nav.key} eventKey={nav.key} dotIndent={indent}>
        <Link
          href={nav.path}
          className="flex items-center gap-2 h-full w-full"
          target={nav.isExternalLink ? '_blank' : ''}
          onClick={() =>
            onLinkClick?.({
              key: nav.key,
              title: nav.title,
              path: nav.path,
            })
          }
        >
          {showIcon && <VerticalMenuIcon icon={nav.icon} />}
          {showTitle && <span>{t(nav.translateKey, nav.title)}</span>}
        </Link>
      </MenuItem>
    </AuthorityCheck>
  )
}

const VerticalSingleMenuItem = ({
  nav,
  onLinkClick,
  sideCollapsed,
  direction,
  indent,
  renderAsIcon,
  userAuthority,
  showIcon,
  showTitle,
  t,
  currentKey,
  parentKeys,
}: Omit<VerticalMenuItemProps, 'title' | 'translateKey'>) => {
  return (
    <>
      {sideCollapsed ? (
        <CollapsedItem
          currentKey={currentKey}
          parentKeys={parentKeys}
          nav={nav}
          direction={direction}
          renderAsIcon={renderAsIcon}
          userAuthority={userAuthority}
          t={t}
          onLinkClick={onLinkClick}
        >
          <DefaultItem
            nav={nav}
            sideCollapsed={sideCollapsed}
            userAuthority={userAuthority}
            showIcon={showIcon}
            showTitle={showTitle}
            t={t}
            onLinkClick={onLinkClick}
          />
        </CollapsedItem>
      ) : (
        <DefaultItem
          nav={nav}
          sideCollapsed={sideCollapsed}
          userAuthority={userAuthority}
          showIcon={showIcon}
          showTitle={showTitle}
          indent={indent}
          t={t}
          onLinkClick={onLinkClick}
        />
      )}
    </>
  )
}

export default VerticalSingleMenuItem
