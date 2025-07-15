import React, { useEffect } from 'react'
import { ProjectDeveloper } from '@/components/projectDeveloper/ProjectDeveloper'
import { useProjectDeveloperStore } from '@/stores/useProjectDeveloperStore'
import { componentLibrary } from '@/components/projectDeveloper/ComponentLibrary'

export const ProjectDeveloperPage: React.FC = () => {
  const { setComponentLibrary } = useProjectDeveloperStore()

  useEffect(() => {
    // 初始化组件库
    setComponentLibrary(componentLibrary)
  }, [setComponentLibrary])

  return <ProjectDeveloper />
}
