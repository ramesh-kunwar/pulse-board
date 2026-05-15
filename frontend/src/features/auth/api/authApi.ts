import { api } from '#/lib/axios'

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/sign-in', data)
  return response.data
}

export const registerApi = async (data: {
  email: string
  password: string
}) => {
  const response = await api.post('/auth/sign-up', data, {
    withCredentials: true,
  })
  return response.data
}
