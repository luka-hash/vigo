package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Dino struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type App struct {
	Data     []Dino
	BuildDir string
}

func NewApp(data []Dino, buildDir string) *App {
	return &App{
		Data:     data,
		BuildDir: buildDir,
	}
}

func (a *App) GetDinos(w http.ResponseWriter, r *http.Request) {
	// time.Sleep(time.Second * 1)
	page := r.URL.Query().Get("page")
	window := 15
	pageNum := 0
	if page != "" {
		var err error
		pageNum, err = strconv.Atoi(page)
		if err != nil {
			log.Println("Invalid page number")
			http.Error(w, "Invalid page number", http.StatusBadRequest)
			return
		}
	}
	if pageNum < 0 {
		log.Println("Page number must be non-negative")
		http.Error(w, "Page number must be non-negative", http.StatusBadRequest)
		return
	}
	if pageNum >= len(a.Data)/window {
		log.Println("Page number out of range")
		http.Error(w, "Page number out of range", http.StatusBadRequest)
		return
	}
	start := pageNum * window
	end := min(start+window, len(a.Data))
	// log.Println("Start:", start, "End:", end)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a.Data[start:end])
}

func main() {
	dev := flag.Bool("dev", false, "run in development mode")
	flag.Parse()
	dinos := make([]Dino, 0)
	file, err := os.ReadFile("./data.json")
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal(file, &dinos)
	if err != nil {
		panic(err)
	}
	app := NewApp(dinos, "../dist")

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Route("/api", func(r chi.Router) {
		r.Get("/dinos", app.GetDinos)
	})

	if !*dev {
		r.Handle("/*", http.FileServer(http.Dir(app.BuildDir)))
	}

	fmt.Println("Starting server at http://localhost:8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		panic(err)
	}
}
