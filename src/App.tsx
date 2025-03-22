import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';

interface Dino {
  name: string;
  description: string;
}

function App() {
  const [dinos, setDinos] = useState<Dino[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchDinos = async (pageNum: number = 0) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dinos?page=${pageNum}`);
      const data = await response.json();

      if (data.length < 15) {
        setHasMore(false);
      }

      setDinos(prev => [...prev, ...data]);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching dinos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDinos();
  }, []);

  return (
    <>
      <h1>Dinos</h1>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <ol>
        {dinos.map((dino, index) => (
          <li key={index}> {dino.name} </li>
        ))}
      </ol>
      {hasMore && (
        loading ? (
          <div>
            <em>Loading...</em>
          </div>
        ) : (
          <button onClick={() => {
            return fetchDinos(page + 1)
          }}>
            Load More
          </button>
        )
      )}
    </>
  )
}

export default App
