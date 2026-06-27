import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { getProjectById } from '../apiClient'


function ProjectPage() {

  const {id} = useParams()
  const projectId = Number (id)

  const {data: project,isPending,isError} = useQuery({ queryKey: ['project', projectId], queryFn: () => getProjectById(projectId) })

  if (isPending) {
    return <p>loading project...</p>
  }

  if (isError) {
    return <p>error: this id does not match anything</p>
  }

  return (
     <div>
      <h1>Project name : {project.fullName}</h1>
      <p>Description: {project.description}</p>
      <p>GitHub url: {project.htmlUrl}</p>
      <p>Homepage: {project.homepage}</p>
      <p>Topics: {project.topics?.join(',')}</p>
      <p>Programing language: {project.primaryLanguage}</p>
      <p>Open issues : {project.openIssuesCount}</p>
      <p>Is open source? :{project.isOpenSource ? 'Yes':'No'}</p>
      <p>Last synced: {project.lastSyncedAt}</p>
     </div>
  )
}

export default ProjectPage
