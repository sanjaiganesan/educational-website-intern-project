import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { addQuizzes, deleteQuizzes, getQuizzes, getUserdata, updateQuizzes } from "./API"

function Quizzes()
{
    const [questions,setQue] = useState([])
    const [loader,setLoader] = useState(false)
    const [update,setUpdate] = useState(false)
    const [data,setdata] = useState()
    const navigate = useNavigate()
    const [userData,setUser] = useState()
    const id = useRef()
    const title = useRef()
    const description = useRef()
    const update_id = useRef()
    const update_title = useRef()
    const update_description = useRef()
    useEffect(() =>{
        fetchQuiz()
    },[])

    const fetchQuiz = () => {
        setLoader(true)
        getQuizzes().then(data => {
            // console.log(res.data)
            setQue(data)
            setLoader(false)
            getUserdata().then(res => {
                setUser(res)
            })
        }).catch(error => alert(error))
    }

    const submit = (event) => {
        event.preventDefault()
        setQue([])
        setLoader(true)
        const input = {
            course_id:id.current.value,
            quiz_title:title.current.value,
            quiz_description:description.current.value
        }
        // console.log(input)
        addQuizzes(input).then(data => fetchQuiz())
        .catch(err => console.error(err))
    }

    const updatefn = (event) =>{
        event.preventDefault()
        setUpdate(false)
        setQue([])
        setLoader(true)
        const input = {
            old_quiz_id:data.quiz_id,
            quiz_id:data.quiz_id,
            course_id:update_id.current.value,
            quiz_title:update_title.current.value,
            quiz_description:update_description.current.value
        }
        updateQuizzes(input).then(data => {
            fetchQuiz()
        })
        .catch(err => console.error(err))
    }

    const deletefn = (question) => {
        setQue([])
        setLoader(true)
        const status = window.confirm("Are you sure want to delete ?")
        if(status)
        {
            deleteQuizzes(question.quiz_id).then(data => fetchQuiz())
            .catch(err => console.error(err))
        }
    }
    return (
        <>
        <div className="educators">
            <div className="quizpage">
            {update && <div className="update">
                <form className=" admin-form Modal" onSubmit={updatefn}>
                <span className="close" onClick={() => (setUpdate(false))}>x</span>
                    <input id='course' type="text" ref={update_id} placeholder="course id" required/>
                    <input id='qui' type="text" ref={update_title} placeholder="quiz title" required/>
                    <input id='desc' type="text" ref={update_description} placeholder="quiz description" required/><br/>
                    <input id='upsubmit' type="submit" value="Update"/>
                </form>
            </div>}
            {userData?.role !== 'Student' && <form className="admin-form" onSubmit={submit}>
                        <input id='id' type="text" ref={id} placeholder="course id" required/>
                        <input id='tit' type="text" ref={title} placeholder="quiz title" required/>
                        <input id='qu' type="text" ref={description} placeholder="quiz description" required/>
                        <input id='subm' type="submit" value="+"/>
                    </form>}
                {questions.length > 0 && <h1 className="heading">Practice quiz</h1>}
                <div className="quizpage">
                    {loader && <div className="loader"/>}
                    {questions.length > 0 && questions.map((question,index)=>{
                        return(
                            <>
                                <div className="ques quiz" key={index}>
                                    <span className="title" onClick={() => {navigate(`/main/quiz/${question.quiz_id}`)}}>{index+1}. {question.quiz_title}</span>
                                    <p>{question.quiz_description}</p>
                                    <div className="edit">
                                        {userData?.role !== 'Student' && <input id='updatebtn' type="button" className="updatebtn" value="update" onClick={async() => {
                                            setUpdate(true)
                                            setdata(question)
                                        }}/>}
                                        {userData?.role !== 'Student' && <input id='deletebtn' type="button" className="deletebtn" value="Delete" onClick={() => {
                                            deletefn(question)
                                        }}/>}
                                    </div>
                                </div>
                                
                            </>
                        )
                    })}
                </div>
                </div>
            </div>
        </>
    )
}

export default Quizzes