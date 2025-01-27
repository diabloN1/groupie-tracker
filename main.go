package main

import (
	"fmt"
	"groupie/utils"
	"log"
	"net/http"
)

// ----------- Fetch Api ---------------
func init() {
	fmt.Println("Curling data...")
	utils.GetArtists()
	utils.GetSubData()
	fmt.Println("data obtained successfully")
}

// ----------- Run server ---------------
func main() {
	http.Handle("/static/", http.StripPrefix("/static", http.HandlerFunc(utils.HandleStatic)))

	http.HandleFunc("/", utils.Handler)
	http.HandleFunc("/Artists", utils.HandlerArtist)

	log.Println("Server start in : http://localhost:8000/")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("Error:", err)
	}
}
