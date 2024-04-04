import { useEffect, useRef, useState } from "react"
import { addEducators, deleteEducators, getEducators, getUserdata } from "./API"

function Educators()
{
    const [educators,setEd] = useState([])
    const [loader,setLoader] = useState(false)
    const [data,setData] = useState()
    const email = useRef()
    const subjects = useRef()
    const biography = useRef()
    useEffect(() => {
        fetchEducators()
    },[])

    const fetchEducators = () => {
        setLoader(true)
        getEducators().then(data => {
            setEd(data)
            // console.log(data)
            setLoader(false)
            getUserdata().then((res) => {
                setData(res)
            })
        }).catch(error => alert(error))
    }
    const submit = (event) => {
        event.preventDefault()
        setLoader(true)
        const input = {
            email:email.current.value,
            biography:biography.current.value,
            subjects:subjects.current.value.split(',')
        }
        // console.log(input)
        addEducators(input).then((res) => {

            if (res.status !== "Inserted")
            {
                setLoader(false)
                alert(res.status)
            }
            
            else
            {
                setEd([])
                setLoader(true)
                fetchEducators()
            }
        })
        .catch(err => console.error(err))
    }

    const deletefn = (email) => {
        const status = window.confirm("Are you sure want to delete ?")
        if(status)
        {
            setEd([])
            setLoader(true)
            deleteEducators(email).then(data => fetchEducators())
            .catch(err => console.error(err))
        }
      }

    return (
        <>
            <div className="educators">
            <div className="educators">
                {data?.role === 'admin' && <form className="admin-form" onSubmit={submit}>
                        <input id="mail" type="email" ref={email} placeholder="Enter email" required/>
                        <input id='bio'type="text" ref={biography} placeholder="biography" required/>
                        <input id="sub" type="text" ref={subjects} placeholder="subjects" required/>
                        <input id="sub" type="submit" value="+"/>
                    </form>}
                {educators.length > 0 && <h1 className="heading">Our Experts</h1>}
                <div className="educators">
                    {loader && <div className="loader"/>}
                    {educators.length > 0 && educators.map((educator,index) => {
                        return(
                            <div className={"profilecard"} key={index}>
                            {data?.role === 'admin' && <span className="close" onClick={()=>{deletefn(educator.email)}}>x</span>}
                            <div>
                                <img src={educator.image} className="image" alt="avatar"/>
                            </div>
                                <div className={"details"}>
                                    <span className={"name"}>{educator.username}</span>
                                    <span><i className="uil uil-envelope"/> {educator.email}</span>
                                    <div className="subjects">
                                        {educator.subjects.map((subject,index) => {
                                            return <span className="subject" key={index}>{subject}</span>
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            </div>
        </>
    )
}

export default Educators