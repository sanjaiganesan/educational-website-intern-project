import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"
import { addQuiz, deleteQuiz, evaluateQuiz, getQuiz, getUserdata, updateQuiz, uploadQuiz } from "./API"

function Quiz()
{
    const params = useParams()
    const [data,setData] = useState('')
    const [queID,setQueID] = useState('')
    const [update,setUpdate] = useState(false)
    const [loader,setLoader] = useState(false)
    const [questions,setQue] = useState([])
    const [result,setRes] = useState('')
    const question = useRef()
    const options = useRef()
    const answer = useRef()
    const update_question = useRef()
    const update_options = useRef()
    const update_answer = useRef()
    const file = useRef()
    const [filename,setFile] = useState()
    useEffect(() =>{
        fetchQuiz()
    },[params])

    const fetchQuiz = () => {
        setLoader(true)
        getQuiz(params.id).then(data => {
            // console.log(res.data)
            setQue(data)
            setLoader(false)
            getUserdata().then(res => {
                setData(res.role)
                // console.log(res)
            })
        }).catch(error => alert(error))
    }
    let answers = questions.length > 0 ? new Array(questions.length).fill(null) : null

    const submit = () =>{
        setLoader(true)
        evaluateQuiz(answers,params.id).then(data =>{
            setRes(data)
            setLoader(false)
            let heading = document.getElementById('heading')
            heading.scrollIntoView()
        })
        // alert(`You have scored ${result}/${questions.length}`)
    }

    const addQuestion = (event) => {
        event.preventDefault()
        setQue([])
        setLoader(true)
        const input = {
            quiz_id:params.id,
            question_text:question.current.value,
            question_options:options.current.value.split(","),
            correct_answer:answer.current.value
        }
        // console.log(input)
        addQuiz(params.id,input).then(data => {
            fetchQuiz()
        })
        .catch(err => console.error(err))
    }

    const updatefn = (event) =>{
        event.preventDefault()
        setUpdate(false)
        setQue([])
        setLoader(true)
        const input = {
            quiz_id:params.id,
            question_id:queID,
            question_text:update_question.current.value,
            question_options:update_options.current.value.split(","),
            correct_answer:update_answer.current.value
        }
        updateQuiz(params.id,input).then(data => {
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
            deleteQuiz(question.quiz_id,question.question_id).then(data => fetchQuiz())
            .catch(err => console.error(err))
        }
    }

    const uploadfn = (event) => {
        try {
            event.preventDefault()
            setLoader(true)
            setFile(file.current.files[0].name)
            const input = new FormData()
            input.append('file',file.current.files[0])
            uploadQuiz(params.id,input).then(data => {
                console.log(data)
                setLoader(false)
                setQue([])
                fetchQuiz()
            })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div className="quizpage">
            {update && <div className="update">
                <form className=" admin-form Modal" onSubmit={updatefn}>
                <span className="close" onClick={() => (setUpdate(false))}>x</span>
                    <input id="question" type="text" ref={update_question} placeholder="Question" required/>
                    <input id="options" type="text" ref={update_options} placeholder="options" required/>
                    <input id='ans'type="text" ref={update_answer} placeholder="answer" required/><br/>
                    <input id="usumbit" type="submit" value="Update"/>
                </form>
            </div>}
            {data !== '' && data !== 'Student' && <div><form className="admin-form" onSubmit={addQuestion}>
                        <input id='que' type="text" ref={question} placeholder="Question" required/>
                        <input id='opt'type="text" ref={options} placeholder="options" required/>
                        <input id='ans' type="text" ref={answer} placeholder="answer" required/>
                        <input id='sub' type="submit" value="+"/>
                    </form>
                    <form className="admin-form">
                        <input type="file" ref={file} accept=".csv" style={{color:"#fff"}} onChange={uploadfn}/>
                    </form></div>
                    }
                {loader && <div className="loader"/>}
                {questions.length > 0 && <h1 className="heading" id="heading">{questions[0].quiz_title}</h1>}
                {result !== '' && result >= 0 && <h2 className="result">You have scored {result}/{questions.length}</h2>}
                {questions.length > 0 && questions.map((question,index)=>{
                    return(
                        <div className="ques" key={index}>
                            <span>{index+1}. {question.question_text}</span>
                            <div className="options">
                                {question.question_options.map((option,opt_index) => {
                                    return(
                                        <div className="option" key={opt_index}>
                                            <input type="radio" id={option} value={option} name={question.question_id} onChange={e => {
                                                answers[index] = e.target.value
                                                console.log(answers)
                                            }}/>
                                            <label for={option}>{option}</label>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="edit">
                                {data !== 'Student' && <input id="student" type="button" className="updatebtn" value="update" onClick={async() => {
                                    setUpdate(true)
                                    setQueID(question.question_id)
                                }}/>}
                                {data !== 'Student' && <input id="stu" type="button" className="deletebtn" value="Delete" onClick={() => {
                                    deletefn(question)
                                }}/>}
                            </div>
                        </div>
                    )
                })}
                {questions.length > 0 && <input type="submit" className="Loginbutton" onClick={submit}/>}
            </div>
        </>
    )
}

export default Quiz