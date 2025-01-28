package utils

import (
	"fmt"
	"html/template"
	"net/http"
	"strconv"
	"strings"
)

// ------------------ Handle home page -------------------
func Handler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		showError(w, "404 - Page Not Found", http.StatusNotFound)
		return
	}

	tmpl, err := template.ParseFiles("template/Home.html")
	if err != nil {
		showError(w, "500 Internal sever error - error parsing html template", 500)
		fmt.Println(err)
		return
	}
	data1 := artists

	tmpl.Execute(w, data1)
}

// -------------- Handle single artist page --------------
func HandlerArtist(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/Artists" {
		showError(w, "404 - Page Not Found", http.StatusNotFound)
		return
	}

	tmpl, err := template.ParseFiles("template/Artist.html")
	if err != nil {
		showError(w, "500 Internal sever error - error parsing html template", 500)
		fmt.Println(err)
		return
	}

	idString := r.FormValue("id")
	id, err := strconv.Atoi(idString)

	if err != nil || id >= len(artists) {
		showError(w, "404 - Not Found", 404)
		return
	}

	data1 := artists[id-1]
	tmpl.Execute(w, data1)
}



// ------------------ Handle static ------------------
func HandleStatic(w http.ResponseWriter, r *http.Request) {
	if !isAllowedRounte(r.URL.Path) {
		showError(w, "404 - Page Not Found", 404)
		return
	}
	fs := http.FileServer(http.Dir("static"))
	fs.ServeHTTP(w, r)
}

// ------------------ Type convertion -----------------
func interfaceToMap(input any) map[string][]string {
	// First, try to assert input as map[string]interface{}
	interfaceMap := input.(map[string]any)

	// Create a new map[string]string to hold the converted values
	stringMap := make(map[string][]string)

	// Loop through each element and try to convert it to a string
	for key, value := range interfaceMap {

		slice := value.([]any)

		dates := make([]string, len(slice))

		for i, v := range slice {
			str := v.(string)
			dates[i] = str
		}

		stringMap[key] = dates
	}

	return stringMap
}

func interfaceToStringSlice(input any) []string {
	// First, try to assert input as []any
	interfaceSlice, ok := input.([]any)
	if !ok {
		fmt.Println("input is not a []interface{}")
		return nil
	}

	// Create a new []string slice to hold the converted values
	stringSlice := make([]string, len(interfaceSlice))

	// Loop through each element and try to convert it to a string
	for i, v := range interfaceSlice {
		str := v.(string)
		stringSlice[i] = str
	}

	return stringSlice
}

// -------------- HTML error template --------------
func isAllowedRounte(path string) bool {
	allowedRoutes := []string{"/artistStyle.css", "/errStyle.css", "/globalStyles.css", "/homeStyle.css", "folder.png", "index.js", "geo.js"}
	for i := range allowedRoutes {
		if strings.HasSuffix(path, allowedRoutes[i]) {
			return true
		}
	}
	return false
}


// ------------------- HTML ERROR ------------------
type Error struct {
	Status  int
	Message string
}

// Function to render error pages with an HTTP status code
func showError(w http.ResponseWriter, message string, status int) {

	// Set the HTTP status code
	w.WriteHeader(status)

	// Parse the error template
	tmpl, err := template.ParseFiles("template/ErrPage.html")
	if err != nil {
		// If template parsing fails, fallback to a generic error response
		http.Error(w, "Could not load error page", http.StatusInternalServerError)
		return
	}

	httpError := Error{
		Status:  status,
		Message: message,
	}
	// Execute the template with the error message
	err = tmpl.Execute(w, httpError)
	if err != nil {
		// If template execution fails, respond with a generic error
		http.Error(w, "Could not render error page", http.StatusInternalServerError)
	}
}
