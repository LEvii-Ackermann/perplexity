import {setLoading, setError, setUser} from "../auth.slice.js"
import {useDispatch} from "react-redux"
import {register, login, getMe} from "../services/auth.api.js"


export const useAuth = () => {
    const dispatch = useDispatch()

    const handleRegister = async ({email, username, password}) => {
        try {
            dispatch(setLoading(true))
            const data = await register({email, username, password})
        }
        catch(error){
            dispatch(setError(error.message))
        }
        finally{
            dispatch(setLoading(false))
        }
    }

    const handleLogin = async ({email, password}) => {
        try{
            dispatch(setLoading(true))
            const data = await login({email,password})
            dispatch(setUser(data.user))
        }
        catch(error){
            dispatch(setError(error.message))
        }
        finally{
            dispatch(setLoading(false))
        }
    }

    const handleGetMe = async () => {
        try{
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        }
        catch(error){
            dispatch(setError(error.message))
        }
        finally{
            dispatch(setLoading(false))
        }
    }


    return {
        handleRegister,
        handleLogin,
        handleGetMe
    }

}