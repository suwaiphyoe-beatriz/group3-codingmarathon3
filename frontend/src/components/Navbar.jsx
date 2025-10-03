import { Link } from "react-router-dom";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  // 先安全地读 localStorage
  const storedUser = localStorage.getItem("user");
  const username = storedUser ? JSON.parse(storedUser).username : "";

  const handleClick = () => {
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <h1>React Jobs</h1>
      </Link>

      <div className="links">
        {isAuthenticated && storedUser && (
          <div>
            <Link to="/jobs/add-job">Add Job</Link>
            <span>{username}</span>
            <button onClick={handleClick}>Log out</button>
          </div>
        )}

        {!isAuthenticated && (
          <div>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
