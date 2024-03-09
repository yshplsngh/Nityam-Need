import { apiSlice } from "../../app/api/apiSlice"
import { logOut, setCredentials } from "./authSlice"

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: credentials => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...credentials }
            })
        }),
        sendLogout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    dispatch(logOut())
                    setTimeout(() => {
                        dispatch(apiSlice.util.resetApiState())
                    }, 1000)
                } catch (err) {
                    console.log(err)
                }
            }
        }),
        refresh: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'GET',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const { accessToken } = data
                    dispatch(setCredentials({ accessToken }))
                } catch (err) {
                    console.log(err)
                }
            }
        }),
        signup:builder.mutation({
            query:initialUserData => ({
                url:'/auth/signup',
                method:'POST',
                body:{
                    ...initialUserData,
                }
            })
        }),
        verifyDocument:builder.mutation({
            query:initialUserData => ({
                url:'/auth/verifyDocument',
                method:'POST',
                body:{
                    ...initialUserData
                }
            })
        }),
        generateSignature:builder.mutation({
            query:initialUserData => ({
                url:'/auth/generateSignature',
                method:'POST',
                body:{
                    ...initialUserData
                }
            })
        }),
        uploadDocumentUrl:builder.mutation({
            query:documentsUrl => ({
                url:'/auth/uploadDocumentUrl',
                method:'POST',
                body:{
                    ...documentsUrl
                }
            })
        }),
    })
})

export const {
    useLoginMutation,
    useSendLogoutMutation,
    useRefreshMutation,
    useSignupMutation,
    useVerifyDocumentMutation,
    useGenerateSignatureMutation,
    useUploadDocumentUrlMutation,
} = authApiSlice
