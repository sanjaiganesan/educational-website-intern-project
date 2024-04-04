import { uploadToCloud } from "./firebase"

export const uploadImage = (e,user) => {
    // console.log(e.target.files[0])
    const file = e.target.files[0]
    const reader = new FileReader(file)
    const res = {url:''}
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
            res.url = await uploadToCloud(user,new_url)
        }
    }
    return res.url
}