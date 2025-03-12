import { SignIn } from "@clerk/clerk-react";
import { Title } from "../components/Title/Title";
import { Helmet } from "react-helmet-async";

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Login | Top Hackathons</title>
        <meta
          name="description"
          content="Find the best hackathons happening near you. Hackathons are great places to code quickly, learn collaboration, and celebrate your ideas."
        />
        <meta name="author" content="Kishore S R" />
      </Helmet>

      <Title />
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "70px" }}
      >
        <SignIn />
      </div>
    </>
  );
}
