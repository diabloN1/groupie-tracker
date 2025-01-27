package utils

import (
	"encoding/json"
	"log"
	"net/http"
)

// ------------------ Get Artists Data -------------------
func GetArtists() {
	// api url
	artistsURL := "https://groupietrackers.herokuapp.com/api/artists"

	// http get request
	getResp, err := http.Get(artistsURL)
	if err != nil {
		log.Fatal("Error: http get request", err)
	}
	defer getResp.Body.Close()

	// check status is OK
	if getResp.StatusCode != 200 {
		log.Fatal("Error: statu code is not 200", getResp.StatusCode)
	}

	// decode the JSON response into a stract
	errj := json.NewDecoder(getResp.Body).Decode(&artists)
	if errj != nil {
		log.Fatalf("Error: json %v", errj)
	}
}

// --------------- Get Artists Sub-Data -------------------
func GetSubData() {
	urls := []string{
		"https://groupietrackers.herokuapp.com/api/locations",
		"https://groupietrackers.herokuapp.com/api/dates",
		"https://groupietrackers.herokuapp.com/api/relation",
	}
	result := make([]map[string][]map[string]any, 3)
	for i := range urls {
		// http get request
		getResp, errG := http.Get(urls[i])
		if errG != nil {
			log.Fatal("Error: http get request")
		}
		defer getResp.Body.Close()

		// check status is OK
		if getResp.StatusCode != 200 {
			log.Fatal("Error: status code is not 200", getResp.StatusCode)
		}

		// decode the JSON response into a stract
		errj := json.NewDecoder(getResp.Body).Decode(&result[i])
		if errj != nil {
			log.Fatalf("Error: json %v", errj)
		}
	}

	for i := range artists {
		// Assigning dates :
		artists[i].Locations = interfaceToStringSlice(result[0]["index"][i]["locations"])

		// Assigning dates :
		artists[i].Dates = interfaceToStringSlice(result[1]["index"][i]["dates"])

		// Assigning relations :
		artists[i].Relations = interfaceToMap(result[2]["index"][i]["datesLocations"])
	}
}
