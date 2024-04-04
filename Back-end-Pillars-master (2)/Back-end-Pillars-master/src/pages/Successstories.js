import React, { useEffect, useRef, useState } from "react";
import { addSuccessstories, deleteSuccessstories, getSuccessstories } from "./API";
import { useLocation } from "react-router";

const SuccessStories = () => {
  const [loader,setLoader] = useState(false)  
  const [successStories, setSuccessStories] = useState([]);
  const location = useLocation()
  const {role,public_id,username} = location.state
  const courseid = useRef()
  const story = useRef()

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  const fetchSuccessStories = () => {
    setLoader(true)
    setSuccessStories([])
    getSuccessstories()
      .then((data) => {
        setLoader(false)
        setSuccessStories(data);
      })
      .catch((error) => {
        console.error("Error fetching success stories:", error);
      });
  };

  const submit = (event) => {
    event.preventDefault()
    setSuccessStories([])
    setLoader(true)
    const input = {
      user_id : public_id,
      course_id:courseid.current.value,
      story_content:story.current.value
    }
    addSuccessstories(input)
    .then((data) => {
      fetchSuccessStories()
      courseid.current.value = ''
      story.current.value = ''
    })
    .catch(err => console.error(err))
    console.log(input)
  }

  const deletefn = (story) => {
    const status = window.confirm("Are you sure want to delete ?")
    if(status)
    {
        setSuccessStories([])
        setLoader(true)
        deleteSuccessstories(story.success_story_id).then(data => fetchSuccessStories())
        .catch(err => console.error(err))
    }
  }

  return (
    <>
    <div className="educators">
        <div className="success">
        {role === 'Student' && <form className="admin-form" onSubmit={submit}>
                        <input id='cid' type="text" ref={courseid} placeholder="course id" required/>
                        <input id='sid' type="text" ref={story} placeholder="story" required/>
                        <input id='ssbtn' type="submit" value="+"/>
                    </form>}
            {loader && <div className="loader"/>}
            {successStories.length > 0 && <h1 className="heading">Success Stories</h1>}
            <div className="success stories">
                {successStories.length > 0 && successStories.map((story,index) => {
                    return <div className="review" key={index}>
                        {username === story.username || role === 'admin' ? <span className="close" onClick={()=>{deletefn(story)}}>x</span> : null}
                        <img src={story.image} className="image" alt="avatar"/>
                        <div className="cover"/>
                        <span className="name">{story.username}</span>
                        {/* <span>course:{story.course}</span> */}
                        <p className="content">{story.story_content}</p>
                    </div>
                })}
            </div>
        </div>
        </div>
    </>
  );
};

export default SuccessStories;
