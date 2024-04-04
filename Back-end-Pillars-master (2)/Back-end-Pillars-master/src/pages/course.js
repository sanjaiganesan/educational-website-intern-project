// Courses.js

import React, { useEffect, useRef, useState } from "react";
import { addCourses, deleteCourses, getCourses, getUserdata } from "./API";

function Courses() {
  const [data, setData] = useState("");
  const [courses, setCourses] = useState([]);
  const [loader, setLoader] = useState(false);
  const courseName = useRef();
  const courseDescription = useRef();
  const courseDuration = useRef();
  const enrollmentFee = useRef();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoader(true);
    getCourses()
      .then((data) => {
        setCourses(data);
        setLoader(false);
        getUserdata()
          .then((res) => {
            setData(res);
            console.log(res);
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => alert(error));
  };

  const submit = (event) => {
    event.preventDefault();
    setLoader(true);
    const input = {
      user_id: data.public_id,
      course_name: courseName.current.value,
      course_description: courseDescription.current.value,
      course_duration: courseDuration.current.value,
      enrollment_fee: enrollmentFee.current.value,
    };
    addCourses(input)
      .then((res) => {
        if (res.status !== "Inserted") {
          setLoader(false);
          alert(res.status);
        } else {
          setCourses([]);
          setLoader(true);
          fetchCourses();
          courseName.current.value = courseDescription.current.value = courseDuration.current.value = enrollmentFee.current.value = "";
        }
      })
      .catch((err) => console.error(err));
  };

  const deleteCourseFn = (courseId) => {
    const status = window.confirm("Are you sure you want to delete?");
    if (status) {
      setLoader(true);
      deleteCourses(courseId)
        .then(() => fetchCourses())
        .catch((err) => console.error(err));
    }
  };

  const handleSubscribe = () => {
    // Replace this with your subscribe logic
    alert("Payment button clicked");
  };

  return (
  
      <div className="educators">
        <div className="courses">
          {data !== "" && data.role !== "Student" && (
            <form className="admin-form" onSubmit={submit}>
              <input id="name" type="text" ref={courseName} placeholder="Course Name" required />
              <input id="des" type="text" ref={courseDescription} placeholder="Course Description" required />
              <input id="dur" type="text" ref={courseDuration} placeholder="Course Duration" required />
              <input id="fee" type="text" ref={enrollmentFee} placeholder="Enrollment Fee" required />
              <input id="subm" type="submit" value="+" />
            </form>
          )}
          {courses.length > 0 && <h1 className="heading">Our Courses</h1>}
          <div className="courses">
            {loader && <div className="loader" />}
            {courses.length > 0 &&
              courses.map((course, index) => {
                return (
                  <div className="course-card" key={index}>
                    {data !== "" && data.role !== "Student" && (
                      <span className="close" onClick={() => deleteCourseFn(course.course_id)}>
                        x
                      </span>
                    )}
                    <div className="details">
                      <span className="name">{course.course_name}</span>
                      <p>{course.course_description}</p>
                      <span>
                        Duration: {course.course_duration} | Fee: {course.enrollment_fees}
                      </span>
                      
                     {/* Conditionally render the "Pay Now" button for students */}
                    {data.role === 'Student' && (
                    <button type="button" onClick={() => handleSubscribe(course.course_id)}>Pay Now</button>
                    )}
                  </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
  
  export default Courses;