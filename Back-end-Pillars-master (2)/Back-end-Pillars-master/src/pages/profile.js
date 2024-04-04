import { useEffect, useRef, useState } from "react"
import { getUserdata, putUserdata } from "./API"
import { NavLink } from "react-router-dom"
import { uploadToCloud } from "./firebase"

const Profile = () =>{
    const [loader,setLoader] = useState(false)  
    const [user,setUser] = useState()
    const [image,setImg] = useState()
    const username = useRef()
    const email = useRef()
    const files = useRef()

    const uploadImage = (e,user) => {
        // console.log(e.target.files[0])
        const file = e.target.files[0]
        const reader = new FileReader(file)
        reader.readAsDataURL(file)
        reader.onload = async () => {
            const image = document.createElement('img')
            image.src = reader.result
            const width = 200
            image.onload = async () => {
                const canvas = document.createElement('canvas')
                const ratio = width/image.width
                canvas.width = width
                canvas.height = image.height * ratio
                const context = canvas.getContext('2d')
                context.drawImage(image,0,0,canvas.width,canvas.height)
                const new_url = context.canvas.toDataURL("image/jpeg",80)
                // console.log(new_url)
                uploadToCloud(user,new_url).then(url => setImg(url))
            }
        }
    }

    const fetchUser =  async () => {
        const data = await getUserdata()
        setUser(data)
        setImg(data.image)
        username.current.value = data.username
        email.current.value = data.email
    }
    useEffect(() => {
        fetchUser()
    },[])

    const submit = (e) =>{
        e.preventDefault()
        setLoader(true)
        const data = new FormData()
        data.append('user_id',user?.public_id)
        data.append('image',image)
        data.append('username',username.current.value)
        data.append('email',email.current.value)

        putUserdata(data).then(() => {
            fetchUser().then(() => {
                setLoader(false)
            })
        })
    }
    
    return (
        <>
            <div className="profilepage">
                {loader && <div className="loader"/>}
                <form onSubmit={submit}>
                    <input type='file' accept='.jpg, .png' ref={files} onChange={(e) => uploadImage(e,user.username)} hidden/>
                    <img src={image} className="image" alt="avatar" onClick={() => files.current.click() }/>
                    <div>
                        <input type="text" ref={username}/>
                        <input type="text" ref={email} name="email"/>
                        <NavLink to={'/forgotpassword'}>Change Password</NavLink>
                        <input type="submit" value={'Save'}/>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Profile