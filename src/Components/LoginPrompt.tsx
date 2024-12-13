import '../Styles/LoginPrompt.css'

interface Props {
  login: ()=>void
  logout: ()=>void
}

const LoginPrompt = ({ login, logout}: Props) => {
  const token = sessionStorage.getItem("token");

    const displayButton = () => {
        if(!token)
            return(
                <>
                    <button className='lg-button' onClick={login}>Login</button>
                </>
            );
        else
        return(
            <>
                <button className='lg-button' onClick={logout}>Logout</button>
            </>
           
            
        );
    }

  return (
    <div className='lg-container'>
      <h2 className='lg-message'>You need to log in to access this page.</h2>
      {/* <button className='lg-button'>Login</button> */}
      {displayButton()}
    </div>
  );
};

export default LoginPrompt;
