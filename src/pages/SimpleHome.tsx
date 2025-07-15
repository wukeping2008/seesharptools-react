import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'

export const SimpleHome: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useAppStore()
  
  return (
    <div style={{ 
      padding: '24px', 
      background: theme === 'dark' ? '#1f1f1f' : '#fff', 
      minHeight: '100%',
      fontSize: '18px',
      color: theme === 'dark' ? '#fff' : '#000'
    }}>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
      <p>{t('home.description')}</p>
      
      <div style={{ marginTop: '32px' }}>
        <h2>{t('home.features.title')}</h2>
        <ul>
          <li>{t('home.features.aiGenerator')}</li>
          <li>{t('home.features.projectDeveloper')}</li>
          <li>{t('home.features.components')}</li>
          <li>{t('home.features.charts')}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '32px' }}>
        <h2>{t('home.techFeatures.title')}</h2>
        <ul>
          <li>{t('home.techFeatures.performance')}</li>
          <li>{t('home.techFeatures.modernUI')}</li>
          <li>{t('home.techFeatures.aiDriven')}</li>
        </ul>
      </div>
    </div>
  )
}
