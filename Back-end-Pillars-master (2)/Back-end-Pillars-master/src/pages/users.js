import { useEffect, useState } from "react"
import { deleteUsersdata, getUsersdata, updateUsersdata } from "./API"
import { useLocation } from "react-router"

const Users = () => {

    const [users,setUsers] = useState([])
    const [loader,setLoader] = useState(false)
    const location = useLocation()
    const {username} = location.state
    const f = new Intl.DateTimeFormat(('en-US'),{
        dateStyle:'short',
        timeStyle:'short'
      })

    const fetchUsers = () => {
        setUsers([])
        setLoader(true)
        getUsersdata().then((data) => {
            // console.log(data)
            setUsers(data)
            setLoader(false)
        }).catch(err => alert(err))
    }

    const updatefn = (user,role) => {
        const status = window.confirm(`Are you sure want to change ${user.username} to ${role} ?`)

        if (!status) return
        setUsers([])
        setLoader(true)
        const input = {
            email:user.email,
            role:role
        }
        // console.log(input)
        updateUsersdata(input).then((data) => {
            setLoader(false)
            fetchUsers()
            // console.log(data)
        }).catch(err => alert(err))
    }

    const deletefn = (email) => {
        const status = window.confirm("Are you sure want to delete ?")
        if(status)
        {
            setUsers([])
            setLoader(true)
            deleteUsersdata(email).then(data => fetchUsers())
            .catch(err => console.error(err))
        }
      }

    useEffect(() => {
        fetchUsers()
    },[])
    return (
        <>
            <div className="users">
            {loader && <div className="loader"/>}
                {users.map((user,index) => {
                    return <div className="user" key={index}>
                        <img src={user.image} className="image" alt="avatar"/>
                        <div className="details">
                            <div className="userdetails">
                                <span><i className="uil uil-user-circle"/> {user.username}</span>
                                {user.role === 'admin' && <span className="role">{user.role}</span>}
                            </div>
                            <span><i className="uil uil-envelope"/> {user.email}</span>
                            <div className="details">
                                <span> <i className="uil uil-calender"/>Registration_date: {f.format(new Date(user.registration_date))}</span>
                            </div>
                        </div>
                       { user.username !==  username ? <div className="edit">
                            <select className="updatebtn" onChange={(e) => updatefn(user,e.target.value)}>
                                <option>{user.role}</option>
                                <option>admin</option>
                                <option>Student</option>
                                <option>teacher</option>
                            </select>
                            {/* <input type="button" className="updatebtn" value={'Promote'} onClick={() => updatefn(user)}/> */}
                            <input id='deletebtn'type="button"  className="deletebtn" value={'Delete'} onClick={() => deletefn(user.email)}/>
                        </div>: <div className="edit">You</div>}
                    </div>
                })}
            </div>
        </>
    )
}

export default Users