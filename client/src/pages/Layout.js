import { Outlet, Link } from "react-router-dom";
import "./Layout.css"

const Layout = () => {
  const reloadPage = () => {
    if (window.location.pathname === "/") {
      window.location.reload()
    }
  }
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/" className="link" onClick={reloadPage}>Home</Link>
          </li>
          <li>
            <Link to="/login" className="link">Login</Link>
          </li>
          {/* <li>
            <Link to="/contact">Contact</Link>
          </li> */}
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;