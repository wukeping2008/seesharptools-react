import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
      'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 14px;
    line-height: 1.5;
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#000000'};
    background-color: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
  }

  /* 确保所有文字在夜间模式下都有足够的对比度 */
  h1, h2, h3, h4, h5, h6, p, span, div, a {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : 'inherit'};
  }

  /* Ant Design 组件文字颜色覆盖 */
  .ant-typography {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff !important' : 'inherit'};
  }

  .ant-typography-title {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff !important' : 'inherit'};
  }

  .ant-typography-paragraph {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85) !important' : 'inherit'};
  }

  .ant-card .ant-card-body {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff' : 'inherit'};
  }

  .ant-card .ant-card-meta-title {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff !important' : 'inherit'};
  }

  .ant-card .ant-card-meta-description {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85) !important' : 'inherit'};
  }

  /* 确保所有文本在深色模式下可见 */
  .ant-statistic-title {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85) !important' : 'inherit'};
  }

  .ant-statistic-content {
    color: ${props => props.theme.mode === 'dark' ? '#ffffff !important' : 'inherit'};
  }

  /* 修复深色模式下的文本对比度 */
  .ant-typography.ant-typography-secondary {
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65) !important' : 'inherit'};
  }

  #root {
    height: 100%;
  }

  .ant-layout {
    min-height: 100vh;
  }

  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f1f1f1'};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#555' : '#c1c1c1'};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.mode === 'dark' ? '#777' : '#a8a8a8'};
  }

  /* 动画效果 */
  .fade-enter {
    opacity: 0;
  }

  .fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in;
  }

  .fade-exit {
    opacity: 1;
  }

  .fade-exit-active {
    opacity: 0;
    transition: opacity 300ms ease-in;
  }
`
