import Constants from '../Constants';
// const SCOPES_URL_PARAM = Constants.SCOPES.join(Constants.SPACE_DELIM);
// import loginStatus from '../loginStatus';


interface Props {
    login: ()=>void
    logout: ()=>void
}

export default function Navbar({ login, logout}: Props) {

    const token = window.localStorage.getItem("token");

    const displayButton = () => {
        if(!token)
            return(
                <>
                    <li><button type="button" className="btn btn-danger" onClick={login}>Login</button></li>
                </>
            );
        else
        return(
            <>
                <li><button type="button" className="btn btn-danger" onClick={logout}>Logout</button></li>
            </>
           
            
        );
    }

    return(<>
        <nav className="nav">
            <a href="/" className="site-title">Sync</a>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/GasMap">Music Map</a></li>
                <li><a href="/About">About</a></li>
                {displayButton()}
            </ul>
        </nav>
    </>);
}