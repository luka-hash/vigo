import { useEffect, useRef, useState, useCallback } from 'react';
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
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchDinos = async (pageNum: number = 0) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dinos?page=${pageNum}`);
      const data = await response.json();

      if (data.length < 15) {
        setHasMore(false);
      }

      setDinos(prev => [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching dinos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDinos();
  }, []);


  const lastDinoRef = useCallback((node: HTMLLIElement) => {
    if (loading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchDinos(nextPage);
          return nextPage;
        });
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, fetchDinos]);


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
          <li key={index} ref={index===dinos.length -1 ? lastDinoRef : null}> {dino.name} </li>
        ))}
      </ol>
      {loading ? <em>Loading...</em> : null}
      {!hasMore ? <em>No more dinos</em> : null}
    </>
  )
}

export default App
