import React, { useEffect, useState } from "react";
import { debounce } from "lodash";
import Search from "./components/search";
import Spinner from "./components/spinner";
import MovieCard from "./components/MovieCard";
import { updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    handler();

    return () => {
      handler.cancel();
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${(encodeURI = query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Error fetching movies");
      }

      const data = await response.json();

      if (data.response === "False") {
        setErrorMessage(data.error || "Error fetching movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      updateSearchCount();
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="patter" />

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without The Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => {
                return <MovieCard key={movie.id} movie={movie} />;
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
