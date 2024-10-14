import { Button } from "@/components/ui/button";
import prisma from "../utils/db";
import axios from "axios";

export default function SeedDatabase() {
  async function postData() {
    "use server";

    const totalPagesToFetch = 100; // Adjust this number to fetch more pages

    try {
      for (let page = 1; page <= totalPagesToFetch; page++) {
        // Fetch popular movies
        const movieOptions = {
          method: 'GET',
          url: 'https://api.themoviedb.org/3/movie/popular',
          params: { page: page },
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNWRkNzRlMTMyMjVkZjQ4YmZmZjZkYjU3MTc5NDg2ZCIsIm5iZiI6MTcyODM3NTkzOS40MDYwOTIsInN1YiI6IjY2Zjg1ZTgwMTQwZmJmNmExYTVmNGE4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.HCS3IpTb3Sh3ZouVmhZqCgONt-nxukh7B79DpVrm6LM',
          },
        };

        // Fetch popular TV shows
        const tvOptions = {
          method: 'GET',
          url: 'https://api.themoviedb.org/3/tv/popular',
          params: { page: page },
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNWRkNzRlMTMyMjVkZjQ4YmZmZjZkYjU3MTc5NDg2ZCIsIm5iZiI6MTcyODM3NTkzOS40MDYwOTIsInN1YiI6IjY2Zjg1ZTgwMTQwZmJmNmExYTVmNGE4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.HCS3IpTb3Sh3ZouVmhZqCgONt-nxukh7B79DpVrm6LM',
          },
        };

        const movieResponse = await axios.request(movieOptions);
        const tvResponse = await axios.request(tvOptions);

        const movies = movieResponse.data.results;
        const tvShows = tvResponse.data.results;

        // Combine movies and TV shows into one list
        const allMedia = [
          ...movies.map((movie: any) => ({ ...movie, type: "movie" })),
          ...tvShows.map((tvShow: any) => ({ ...tvShow, type: "tv" }))
        ];

        // Loop through the combined list and save to the database
        for (const media of allMedia) {
          // Fetch detailed data to get the runtime or episode count
          const mediaDetailsResponse = await axios.get(`https://api.themoviedb.org/3/${media.type}/${media.id}`, {
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNWRkNzRlMTMyMjVkZjQ4YmZmZjZkYjU3MTc5NDg2ZCIsIm5iZiI6MTcyODM3NTkzOS40MDYwOTIsInN1YiI6IjY2Zjg1ZTgwMTQwZmJmNmExYTVmNGE4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.HCS3IpTb3Sh3ZouVmhZqCgONt-nxukh7B79DpVrm6LM',
            }
          });

          const mediaDetails = mediaDetailsResponse.data;

          // Fetch video details to get the trailer link
          const videoResponse = await axios.get(`https://api.themoviedb.org/3/${media.type}/${media.id}/videos`, {
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNWRkNzRlMTMyMjVkZjQ4YmZmZjZkYjU3MTc5NDg2ZCIsIm5iZiI6MTcyODM3NTkzOS40MDYwOTIsInN1YiI6IjY2Zjg1ZTgwMTQwZmJmNmExYTVmNGE4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.HCS3IpTb3Sh3ZouVmhZqCgONt-nxukh7B79DpVrm6LM',
            }
          });

          // Filter to find the trailer (usually type: 'Trailer')
          const trailer = videoResponse.data.results.find(
            (video: { type: string; site: string }) => video.type === 'Trailer' && video.site === 'YouTube'
          );

          // Construct the YouTube URL (if trailer exists)
          const youtubeUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : "";

          // Randomly select between 'movie', 'show', and 'recent' for the category
          const categories = ["movie", "show", "recent"];
          let category;
          
          if (media.type === "movie") {
            category = Math.random() < 0.5 ? "movie" : "recent"; // 50% chance for "recent"
          } else if (media.type === "tv") {
            category = Math.random() < 0.5 ? "show" : "recent";  // 50% chance for "recent"
          }

          // Save media data to the database
          await prisma.movie.create({
            data: {
              imageString: `https://image.tmdb.org/t/p/w500/${media.poster_path}`,
              title: media.title || media.name, // TV shows use 'name' instead of 'title'
              age: media.adult ? 18 : 13, // assuming age 18 for adult content
              duration: mediaDetails.runtime || mediaDetails.episode_run_time?.[0] || 60, // Use runtime for movies or average episode runtime for TV shows
              overview: media.overview,
              release: media.release_date
                ? new Date(media.release_date).getFullYear()
                : media.first_air_date
                ? new Date(media.first_air_date).getFullYear()
                : new Date().getFullYear(), // Use first_air_date for TV shows
              videoSource: "TMDB",
              category: category,
              youtubeString: youtubeUrl, // Trailer YouTube URL
            },
          });
        }

        console.log(`Media from page ${page} successfully saved to the database.`);
      }
    } catch (error) {
      console.error("Error saving media to the database:", error);
    }
  }

  return (
    <div className="m-5">
      <form action={postData}>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
