import Signuppage from "./pages/Signuppage";
import Loginpage from "./pages/Loginpage";
import { Route, Routes } from "react-router";
import Home from "./pages/home";
import Password from "./pages/password";
import Educators from "./pages/educators";
import './App.css'
import Layout from "./pages/layout";
import Quiz from "./pages/Quiz";
import Quizzes from "./pages/Quizzes";
import Contactus from "./pages/Contactus";
import SuccessStories from "./pages/Successstories";
import Forgotpassword from "./pages/forgotpassword";
import CourseList from "./pages/course";
import Users from "./pages/users";
import Profile from "./pages/profile";
function App() {
  return (
    <>
      <Routes>
        <Route index element={<Loginpage/>}/>
        <Route path="/login" element={<Loginpage/>}/>
        <Route path="/signup" element={<Signuppage/>}/>
        <Route path="/forgotpassword" element={<Forgotpassword/>}/>
        <Route path="/main" element={<Layout/>}>
          <Route path="profile" element={<Profile/>}/>
          <Route path="home" element={<Home/>}/>
          <Route path="educators" element={<Educators/>}/>
          <Route path="courses" element={<CourseList/>}/>
          <Route path="quiz" element={<Quizzes/>}/>
          <Route path="quiz/:id" element={<Quiz/>}/>
          <Route path="successstories" element={<SuccessStories/>}/>
          <Route path="contactus" element={<Contactus/>}/>
          <Route path="users" element={<Users/>}/>
        </Route>
        <Route path="/password" element={<Password/>}/>
      </Routes>
    </>
  );
}

export default App;
