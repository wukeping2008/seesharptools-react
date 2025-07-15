import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'

export const SimpleAIGenerator: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useAppStore()
  
  return (
    <div style={{ 
      padding: '24px', 
      background: theme === 'dark' ? '#1f1f1f' : '#fff', 
      minHeight: '100vh',
      fontSize: '18px',
      color: theme === 'dark' ? '#fff' : '#000'
    }}>
      <h1 style={{ color: theme === 'dark' ? '#fff' : 'inherit' }}>{t('aiGenerator.title')}</h1>
      <p style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'inherit' }}>{t('aiGenerator.subtitle')}</p>
      
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ color: theme === 'dark' ? '#fff' : 'inherit' }}>{t('aiGenerator.features.title')}</h2>
        <ul>
          <li>{t('aiGenerator.features.naturalLanguage')}</li>
          <li>{t('aiGenerator.features.smartGeneration')}</li>
          <li>{t('aiGenerator.features.realTimePreview')}</li>
          <li>{t('aiGenerator.features.oneClickDownload')}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ color: theme === 'dark' ? '#fff' : 'inherit' }}>{t('aiGenerator.examples.title')}</h2>
        <ul>
          <li>{t('aiGenerator.examples.thermometer')}</li>
          <li>{t('aiGenerator.examples.progressBar')}</li>
          <li>{t('aiGenerator.examples.ledArray')}</li>
          <li>{t('aiGenerator.examples.digitalDisplay')}</li>
        </ul>
      </div>
    </div>
  )
}
