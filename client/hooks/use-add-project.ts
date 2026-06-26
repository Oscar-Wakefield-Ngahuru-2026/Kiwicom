import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addProject } from '../apiClient'

export function useAddProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
