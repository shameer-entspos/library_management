/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

const API_URL_PREFIX = process.env.API_URL_PREFIX || 'http://127.0.0.1:8000'

// Authentication APIs
export const getUserId = (email: string) => {
  return axios.post(`${API_URL_PREFIX}/api/user/get-user-id/`, {
    email: email,
  })
}

export const getUserSignupInvitationAPI = (code: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/user/get-user-signup-invitation/invitation-code=${code}/`
  )
}

export const acceptUserOrgInvitationAPI = (code: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/user/accept-invitation/invitation-code=${code}/`
  )
}

export const changeUserOrgAPI = ({
  invite,
  password,
}: {
  invite: string
  password: string
}) => {
  return axios.patch(
    `${API_URL_PREFIX}/api/user/accept-invitation/invitation-code=${invite}/`,
    {
      password,
    }
  )
}

export const userAccountSignupAPI = (data: any) => {
  return axios.post(`${API_URL_PREFIX}/api/user/user-signup/`, data)
}

export const requestLoginOtpAPI = (data: any) => {
  return axios.post(`${API_URL_PREFIX}/api/user/request-login-otp/`, data)
}

export const verifyLoginOtpAPI = (data: any) => {
  return axios.post(`${API_URL_PREFIX}/api/user/verify-login-otp/`, data)
}

export const joinOrgAPI = (data: any) => {
  return axios.post(`${API_URL_PREFIX}/api/user/join-org/`, data)
}

export const orgSignUpAPI = (data: any) => {
  return axios.post(`${API_URL_PREFIX}/api/user/org-signup/`, data)
}

export const signUpAPI = (data: any) => {
  return axios.post(`${API_URL_PREFIX}/api/user/signup/`, data)
}

export const loginAPI = (data: { email: string; password: string }) => {
  return axios.post(`${API_URL_PREFIX}/api/user/login/`, data)
}

export const requestOtp = (data: any) => {
  return axios.post(`${API_URL_PREFIX}/api/user/request-otp/`, data)
}

export const verifyOtp = (data: any) => {
  return axios.patch(`${API_URL_PREFIX}/api/user/request-otp/`, data)
}

export const refreshLoginTokenAPI = (data: { refresh: string }) => {
  return axios.post(`${API_URL_PREFIX}/api/token/refresh/`, data)
}

export const deleteAccountAPI = (token: string, id: number) => {
  return axios.delete(`${API_URL_PREFIX}/api/user/delete-account/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const recoverAccountAPI = (email: string) => {
  return axios.post(`${API_URL_PREFIX}/api/user/recover-account/`, { email })
}

export const recoverOTPAccountAPI = (email: string, otp: string) => {
  return axios.post(`${API_URL_PREFIX}/api/user/recover-otp-account/`, {
    email,
    otp,
  })
}

export const getUserProfileDataAPI = async (token: string) => {
  const type = localStorage.getItem('type')

  return axios.get(`${API_URL_PREFIX}/api/user/profile/${type}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
