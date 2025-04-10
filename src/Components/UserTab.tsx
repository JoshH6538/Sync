import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/UserTab.css";

interface Props {
  username: string;
  image: string;
  url: string;
}

export default function UserTab({ username, image, url }: Props) {
  return (
    <div className="container rounded my-3" id="user-tab">
      <div className="row">
        <div className="col-md-6 bg-secondary rounded-start p-0">
          <img src={image} alt="Profile" className="img w-100 rounded-start" />
        </div>
        <div className="col-md-6 rounded-end text-center align-items-center d-flex position-relative">
          <h1 id="user-greeting">
            Welcome, <span>{username}</span>!
          </h1>

          <a
            href={url}
            target="_blank"
            className="text-light md-mt-2 d-flex align-items-center position-md-absolute bottom-0 end-0 me-5 md-mb-4"
          >
            <img
              src="Images/spotify-icon.svg"
              alt="Spotify Icon"
              className="ms-2"
              style={{ width: "30px", height: "30px" }}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
