import { useEffect, useRef, useState } from 'react'
import {NavLink, Outlet, useNavigate} from 'react-router-dom'
import { getUserdata } from './API'
import bgImage from './logo.jpeg';
function Layout(){

    const [data,setData] = useState()
    const [menu,setMenu] = useState(false)
    const navigate = useNavigate()
    const nav = useRef()
    
    useEffect(()=>{
        getUserdata().then(res => {
            setData(res)
            // console.log(res)
        })
    },[])

    const logout = () => {
        sessionStorage.removeItem('user-data')
        navigate('/login')
    }

    const navSlide = ()=>{
        nav.current.classList.toggle('slide')
    }

    return (
        <>
            <div className='layout'>
            <nav>
                <div class="logo">
                <img src={bgImage} alt="Logo"/>
                    <h4>KITE INSTITUTE</h4>
                </div>
                <div class="nav-links" ref={nav}>
                    <li onClick={navSlide}>
                        <NavLink to='/main/home' id='home'>Home</NavLink>
                    </li>

                    <li onClick={navSlide}>
                        <NavLink to='/main/educators' state={data} id='educators'>Educators</NavLink>
                    </li>
                    
                    <li onClick={navSlide}>
                        <NavLink to='/main/courses' state={data} id='course'>Course</NavLink>
                    </li>

                    <li onClick={navSlide}>
                        <NavLink to='/main/quiz' state={data} id='practice'>Practice</NavLink>
                    </li>

                    <li onClick={navSlide}>
                        <NavLink to='/main/successstories' state={data} id='success'>Success Stories</NavLink>
                    </li>

                    <li onClick={navSlide}>
                        <NavLink to='/main/contactus' id='contact'>Contact Us</NavLink>
                    </li>

                    {data && data.role === 'admin' && <li onClick={navSlide}>
                        <NavLink to={'/main/users'} state={data}>Users</NavLink>
                    </li>}

                    {data && <li className='profilepos' onClick={() => setMenu(prev => {return !prev})}>
                        <div className='profile'>
                            <img src={data.image} className='image' alt='avatar'></img>
                            <div className={"details"}>
                                <span className={"username"}>{data.username}</span>
                            </div>
                        </div>
                        {menu && <div className='menu'>
                            <NavLink to={'/main/profile'} state={data}>Profile</NavLink>
                            <span onClick={logout}>Logout</span>
                        </div>}
                    </li>}
                </div>
                <div class="burger" onClick={navSlide}>
                    <div class="line1"></div>
                    <div class="line2"></div>
                    <div class="line3"></div>
                </div>
            </nav>
            <Outlet/>
            </div>
        </>
    )
}

export default Layout