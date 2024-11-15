import MovieVideo from "../components/MovieVideo";
import Navbar from "../components/Navbar";
import Recommendations from"../components/Recommendations";
export default function HomePage() {
  return (
    <div className="p-5 lg:p-0">
      <MovieVideo />
      <h1 className="text-3xl font-bold ">Recommendations:</h1>
      <Recommendations/>
    </div>
  );
}
