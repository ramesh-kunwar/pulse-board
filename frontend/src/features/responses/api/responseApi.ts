// src/features/responses/api/responsesApi.ts
import { api } from '#/lib/axios'

export const submitResponseApi = async (
  pollId: string,
  data: { answers: { questionId: string; optionId: string }[] },
) => {
  const response = await api.post(`/polls/${pollId}/responses`, data)
  return response.data
}
