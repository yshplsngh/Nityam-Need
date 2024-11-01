import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logOut} from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3500',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        console.log(token)
        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    // console.log(args) // request url, method, body
    // console.log(api) // signal, dispatch, getState()
    // console.log(extraOptions) //custom like {shout: true}
    let result = await baseQuery(args, api, extraOptions)
    console.log(result)

    if (result?.error?.status === 403) {
        console.log('sending refresh token')

        const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
        console.log(refreshResult);

        if (refreshResult?.data) {
            api.dispatch(setCredentials({ ...refreshResult.data }))
            result = await baseQuery(args, api, extraOptions)
        } else {

            if (refreshResult?.error?.status === 403) {
                api.dispatch(logOut())
                await baseQuery('/auth/logout',api,extraOptions)
                console.log('logout from api slice due to missing refresh token')
                refreshResult.error.data.message = "your login has expired, sign in again"
            }
            return refreshResult
        }
    }

    if (result.error && result.error.status === 'FETCH_ERROR') {
        result.error.data = result.error.data || { }
        result.error.data.message = "no internet connection";
    }

    console.log(result)
    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    // tagTypes: ['Note', 'User'],
    endpoints: builder => ({})
})