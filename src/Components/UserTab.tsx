import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/UserTab.css";

interface Props {
  username: string;
  image: string;
}

export default function UserTab({ username, image }: Props) {
  return (
    <div className="container rounded my-3" id="user-tab">
      <div className="row">
        <div className="col-md-6 bg-secondary rounded-start p-0">
          <img src={image} alt="Profile" className="img w-100 rounded-start" />
        </div>
        <div className="col-md-6 rounded-end text-center align-items-center d-flex">
          <h1 id="user-greeting">
            Welcome, <span>{username}</span>!
          </h1>
        </div>
      </div>
    </div>
  );
}
