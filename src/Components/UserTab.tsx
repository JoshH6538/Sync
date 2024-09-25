import '../Styles/UserTab.css'

interface Props {
  username: string,
  image: string
}

export default function UserTab({username, image}: Props) {
  return (
    <div className='user-tab-container'>
      <img src={image} alt="none"></img>
      <h1>Welcome, {username}!</h1>
    </div>
  )
}
