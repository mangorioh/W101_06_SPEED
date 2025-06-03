import Link from "next/link";
import NavComponent from "./NavComponent";

const NavBar = () => {
  return (
    <nav className="flex justify-between items-center shadow-xl p-1.5 bg-[#001681] text-white">
      <Link href="/" className="font-bold text-xl ml-2">
        SPEED
      </Link>
      <div className="flex">
        <NavComponent href="/" label="Home" />
        <NavComponent label="Moderation">
          <NavComponent
            href="/moderation/queue"
            label="View Moderation Queue"
          />
          <NavComponent
            href="/moderation/rejects"
            label="View rejection queue"
          />
        </NavComponent>
        <NavComponent label="Articles">
          <NavComponent href="/articles" label="view all articles" />
          <NavComponent href="/articles/submit" label="submit new article" />
        </NavComponent>
        <NavComponent label="Users">
          <NavComponent href="/user/login" label="Login" />
          <NavComponent href="/user/register" label="Register" />
          <NavComponent href="/user/profile" label="Profile" />
        </NavComponent>
      </div>
    </nav>
  );
};

export default NavBar;
