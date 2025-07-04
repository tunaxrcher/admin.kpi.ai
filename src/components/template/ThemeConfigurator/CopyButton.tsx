import Notification from '../../ui/Notification'
import Button from '../../ui/Button'
import toast from '../../ui/toast'
import { themeConfig } from '../../../configs/theme.config'
import useTheme from '../../../utils/hooks/useTheme'

const CopyButton = () => {
  const theme = useTheme((state) => state)

  const handleCopy = () => {
    const config = {
      ...themeConfig,
      ...theme,
      layout: {
        type: theme.layout.type,
        sideNavCollapse: theme.layout.sideNavCollapse,
      },
      panelExpand: false,
    }

    navigator.clipboard.writeText(`
            
export const themeConfig: ThemeConfig = ${JSON.stringify(config, null, 2)}
`)

    toast.push(
      <Notification title="Copy Success" type="success">
        {`Please replace themeConfig in 'src/configs/theme.config.ts'`}
      </Notification>,
      {
        placement: 'top-center',
      },
    )
  }

  return (
    <Button block variant="solid" onClick={handleCopy}>
      Copy config
    </Button>
  )
}

export default CopyButton
