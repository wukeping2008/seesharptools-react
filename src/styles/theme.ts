import { ThemeConfig, theme } from 'antd'

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2E86AB',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
    },
  },
}

export const darkTheme: ThemeConfig = {
  ...lightTheme,
  algorithm: theme.darkAlgorithm,
  token: {
    ...lightTheme.token,
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255, 255, 255, 0.85)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.65)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.45)',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#262626',
    colorBgLayout: '#141414',
  },
  components: {
    ...lightTheme.components,
    Typography: {
      colorText: '#ffffff',
      colorTextSecondary: 'rgba(255, 255, 255, 0.85)',
      colorTextTertiary: 'rgba(255, 255, 255, 0.65)',
    },
    Card: {
      colorText: '#ffffff',
      colorTextSecondary: 'rgba(255, 255, 255, 0.85)',
      colorBgContainer: '#1f1f1f',
    },
    Layout: {
      colorText: '#ffffff',
      colorBgContainer: '#1f1f1f',
      colorBgHeader: '#001529',
      colorBgBody: '#141414',
    },
  },
}
