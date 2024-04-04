import axios from "axios"

const url = process.env.REACT_APP_HOST
// const url = "http://127.0.0.1:5000"

export const Login = async(input) => {
    const {data} = await axios.post(`${url}/login`,input)

    return data
}

export const SignUp = async(input) => {
    const {data} = await axios.post(`${url}/register`,input)

    return data
}

export const ForgotPassword = async(input) => {
    const {data} = await axios.post(`${url}/forgotpassword`,input)

    return data
}

export const getUserdata = async () => {
    let data = sessionStorage.getItem('user-data') || null;
    if(data === null)
    {
        let token = sessionStorage.getItem('API_Key');
        token = JSON.parse(token);
        let {data} = await axios.get(`${url}/user?apikey=${token}`)
        sessionStorage.setItem('user-data',JSON.stringify(data))
        return data;
    }
    else
    {
        data = JSON.parse(data)
    }
    return data;
  };

export const putUserdata = async (input) => {
let token = sessionStorage.getItem('API_Key');
token = JSON.parse(token);
const { data } = await axios.put(`${url}/user?apikey=${token}`,input)

return data;
};

export const getUsersdata = async () => {
let token = sessionStorage.getItem('API_Key');
token = JSON.parse(token);
const { data } = await axios.get(`${url}/users?apikey=${token}`)

return data;
};

export const updateUsersdata = async (input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const { data } = await axios.put(`${url}/users?apikey=${token}`,input)
    
    return data;
};

export const deleteUsersdata = async (email) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const { data } = await axios.delete(`${url}/users?email=${email}&&apikey=${token}`)
    
    return data;
};

export const getEducators = async () => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const { data } = await axios.get(`${url}/educators?apikey=${token}`)
    
    return data;
};

export const addEducators = async (input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const { data } = await axios.post(`${url}/educators?apikey=${token}`,input)
    
    return data;
};

export const deleteEducators = async (email) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const { data } = await axios.delete(`${url}/educators?email=${email}&&apikey=${token}`)
    
    return data;
};
  
export const getCourses = async () => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.get(`${url}/courses?apikey=${token}`)

    return data
}

export const addCourses = async (input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.post(`${url}/courses?apikey=${token}`,input)

    return data
}

export const deleteCourses = async (course_id) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.delete(`${url}/courses/${course_id}?apikey=${token}`)

    return data
}

export const getQuizzes = async () => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.get(`${url}/quiz?apikey=${token}`)

    return data
}

export const addQuizzes = async (input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.post(`${url}/quiz?apikey=${token}`,input)

    return data
}

export const updateQuizzes = async (input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.put(`${url}/quiz?apikey=${token}`,input)

    return data
}

export const deleteQuizzes = async (quiz_id) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.delete(`${url}/quiz?quiz_id=${quiz_id}&&apikey=${token}`)

    return data
}
export const getQuiz = async (quiz_id) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.get(`${url}/quiz/${quiz_id}?apikey=${token}`)

    return data
}

export const addQuiz = async (quiz_id,input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.post(`${url}/quiz/${quiz_id}?apikey=${token}`,input)

    return data
}

export const updateQuiz = async (quiz_id,input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.put(`${url}/quiz/${quiz_id}?apikey=${token}`,input)

    return data
}

export const deleteQuiz = async (quiz_id,ques_id) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.delete(`${url}/quiz/${quiz_id}?question_id=${ques_id}&&apikey=${token}`)

    return data
}

export const evaluateQuiz = async(input,quiz_id) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.post(`${url}/quiz/evaluate/${quiz_id}?apikey=${token}`,input)

    return data
}

export const uploadQuiz = async(quiz_id,input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.post(`${url}/quiz/fileupload/${quiz_id}?apikey=${token}`,input)

    return data
}

export const getSuccessstories = async () => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.get(`${url}/successstories?apikey=${token}`)

    return data
}

export const addSuccessstories = async(input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.post(`${url}/successstories?apikey=${token}`,input)

    return data
}

export const deleteSuccessstories = async(story_id) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.delete(`${url}/successstories?story_id=${story_id}&&apikey=${token}`)

    return data
}

export const contactUs = async(input) => {
    let token = sessionStorage.getItem('API_Key');
    token = JSON.parse(token);
    const {data} = await axios.post(`${url}/sendmail?apikey=${token}`,input)

    return data
}