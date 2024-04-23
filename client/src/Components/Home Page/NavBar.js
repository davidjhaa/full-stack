import React, { useEffect }from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import "../Styles/nav.css";


function NavBar() {
  const { user, setUser, logout } = useAuth();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <nav>
      <div className="menu">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/allPlans">Plans</Link>
          </li>
          {user ? (
            <>
              {console.log("current user", user)}
              <li>
                <Link to="/profilePage">{user}</Link>
              </li>
              <li>
                <Link to="/login" onClick={logout}>
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;



