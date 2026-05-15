import { api } from '#/lib/axios'

export const createPollApi = async (data: any) => {
  const payload = {
    title: data.title,
    isAnonymous: data.isAnonymous,
    expiresAt: new Date(data.expiresAt).toISOString(),
    questions: data.questions.map((q: any, qIndex: number) => ({
      question_text: q.questionText,
      is_mandatory: q.isMandatory,
      order: qIndex + 1,
      options: q.options.map((o: any, oIndex: number) => ({
        option_text: o.optionText,
        order: oIndex + 1,
      })),
    })),
  }
  const response = await api.post('/polls', payload)
  return response.data
}

export const getPollsApi = async () => {
  const response = await api.get('/polls')
  return response.data
}

export const getPollApi = async (id: string) => {
  const response = await api.get(`/polls/${id}`)
  return response.data
}

export const getAnalyticsApi = async (id: string) => {
  const response = await api.get(`/polls/${id}/analytics`)
  return response.data
}

export const publishPollApi = async (id: string) => {
  const response = await api.post(`/polls/${id}/publish`)
  return response.data
}

export const deletePollApi = async (id: string) => {
  const response = await api.delete(`/polls/${id}`)
  return response.data
}
