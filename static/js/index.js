// Init main variables for filters
var searchValue = ""
var locationsFilterValue = ""
var selectedMembers = [];
var creationDateRangeValue = [0, 2024]
var firstAlbumRangeValue = [0, 2024]

// Read and parse json (takes a string and returns the parsed object)
const artists = JSON.parse(document.getElementById('artistData').textContent)

// Function to show results
function showResults() {

    const cards = document.getElementsByClassName('card');
    artists.forEach((artist, index) => {

        //----------- show based on search --------------
        cards[index].style.display = 'none';
        // Searching strings from artist...
        const stringSearch = [artist.name, artist.firstAlbum, artist.creationDate]
        stringSearch.forEach(item => {
            if (String(item).toLowerCase().includes(searchValue)) {
                cards[index].style.display = ''
            }
        })

        // Search arrays from artist...
        const arraySearch = [artist.Locations, artist.members, artist.Dates]
        arraySearch.forEach(array => {
            array.some((item) => {
                if (item.toLowerCase().includes(searchValue)) {
                    cards[index].style.display = '';
                }
            })
        })

        //----------- show based on filters --------------
        // locations
        if (locationsFilterValue && locationsFilterValue !== "All") {
        const hasLocation = artist.Locations.some(location => location.toLowerCase().includes(locationsFilterValue));
        if (!hasLocation) {
            cards[index].style.display = 'none';
        }}

        // members count
        var membersLen = artist.members.length
        if (!selectedMembers[membersLen - 1]) {
            cards[index].style.display = 'none'
        }

        // creation date
        if (!(artist.creationDate >= creationDateRangeValue.min && artist.creationDate <= creationDateRangeValue.max)) {
            cards[index].style.display = 'none'
        }

        // first album
        const firstAlbumYear = parseInt(artist.firstAlbum.split('-')[2])
        if (!(firstAlbumYear >= firstAlbumRangeValue.min && firstAlbumYear <= firstAlbumRangeValue.max)) {
            cards[index].style.display = 'none'
        }
    })
}

document.getElementById('search').addEventListener('input', searchChangeHandler) // Event listener to search input

// Search change handler
function searchChangeHandler() {

    searchValue = this.value.toLowerCase(); // Get search value

    //     -------------- Showing results --------------
    showResults()

    // ------------ EventListener for suggestion click ------------
    const elements = [...document.getElementsByClassName('a')]; // Convert Html collection an array
    elements.forEach((element) => {
        element.addEventListener("click", (event) => {
            const clickedValue = event.target.innerHTML.split(' - ')[0]
            document.getElementById('search').value = clickedValue // set search input
            showResults(clickedValue.toLowerCase()) // Execute search change handler to load search
        });
    });
}


// Extract values from data (artists) as a set() for search suggestions.
artists.forEach(artist => { delete artist.Relations }) // Delete artists relations since it's not wanted in suggestions
const searchExemples = new Set(); // Set is an array that only holds unique items
const stack = [{ value: artists, parent: "" }]; // Initialize the stack

while (stack.length > 0) {
    const current = stack.pop(); // Get and remove the last element from the stack
    const { value, parent } = current; // Destructure to get value and parent

    if (((typeof value === "string" && !value.includes("https")) || typeof value == "number")) { //&& (parent != "image")
        searchExemples.add(value + " - " + parent);
    } else if (value instanceof Array) { // We didn't use typeof because it define the array as an object
        // If it's an array, push all its items onto the stack with the current parent name
        value.forEach((item) => {
            stack.push({ value: item, parent: parent }); // Keep the parent name the same for array items
        });
    } else if (value instanceof Object) {
        // If it's an object, push all its values onto the stack with their keys as parent names
        Object.entries(value).forEach(([key, val]) => {
            stack.push({ value: val, parent: key }); // Use the key as the parent name
        });
    }
}

searchExemples.forEach((exemple) => {
    document.getElementById('searchExemples').innerHTML += ("<option value='"+exemple.split(" - ")[0]+"'>" + exemple + "</option></br>")
})




// -------------------------------- Filters Part -------------------------------

// ------------ Toggle Filters visibility ---------
const toggleButton = document.getElementById('toggleFilterButton');
const filtersSlider = document.querySelector('.push');
const containerSection = document.querySelector('.container');

toggleButton.addEventListener('click', () => {
    const isActive = filtersSlider.classList.toggle('active'); // Toggle the push section
    containerSection.classList.toggle('active', isActive); // Adjust bottom section if active
});

// ------------ Set innerHtml Filters ------------
document.getElementById('toggleFilterButton').addEventListener('click', () => {
const filterDiv = document.getElementById('filterDiv');

if (filterDiv.style.display === 'none' || filterDiv.style.display === '') {
    // Show the filter div
    filterDiv.style.display = 'block';
    filterDiv.classList.add('active');
} else {
    // Hide the filter div
    filterDiv.style.display = 'none';
    filterDiv.classList.remove('active');
}
})
// Locations filter
var searchArray = [...searchExemples]
var locations = searchArray.filter(exemple => exemple.includes("Locations"))
const locationsFilter = document.getElementById('locationsFilter')
locations.forEach(item => locationsFilter.innerHTML += "<option class='locationsOption'>" + item.split(" - ")[0] + "</option>")

// Count Members-count - creations-Dates - first-albums filters min <-> max
var maxMembers = 0
var creationDatesInterval = { min: 2024, max: 0 }
var firstAlbumsInterval = { min: 2024, max: 0 }
artists.forEach(artist => {
    if (maxMembers < artist.members.length) {
        maxMembers = artist.members.length
    }
    if (creationDatesInterval.min > artist.creationDate) {
        creationDatesInterval.min = artist.creationDate
    } else if (creationDatesInterval.max < artist.creationDate) {
        creationDatesInterval.max = artist.creationDate
    }
    const firstAlbumYear = parseInt(artist.firstAlbum.split('-')[2])
    if (firstAlbumsInterval.min > firstAlbumYear) {
        firstAlbumsInterval.min = firstAlbumYear
    } else if (firstAlbumsInterval.max < firstAlbumYear) {
        firstAlbumsInterval.max = firstAlbumYear
    }
})

// Members-count
const membersCountFilter = document.getElementById('membersCountFilter')
i = 1
while (i <= maxMembers) {
    membersCountFilter.innerHTML += "<input type='checkbox' id='" + i + "' checked/>" + i
    selectedMembers[i - 1] = true
    i++
}

// Creation Date
const creationDateRange = document.getElementById('creationDateRange');
noUiSlider.create(creationDateRange, {
    start: [creationDatesInterval.min, creationDatesInterval.max],
    connect: true,
    range: {
        'min': creationDatesInterval.min,
        'max': creationDatesInterval.max
    },
    step: 1
});
// Fist Album
const firstAlbumRange = document.getElementById('firstAlbumRange');
noUiSlider.create(firstAlbumRange, {
    start: [firstAlbumsInterval.min, firstAlbumsInterval.max],
    connect: true,
    range: {
        'min': firstAlbumsInterval.min,
        'max': firstAlbumsInterval.max
    },
    step: 1
});

// ------------ Hamdlers ------------
// Locations Handler
locationsFilter.addEventListener('click', event => {
    locationsFilterValue = event.target.value
    showResults()
})

// Members-count Handler
const checkBoxes = [...membersCountFilter.children]
checkBoxes.forEach((item, index) => {
    item.addEventListener('change', event => {
        if (event.target.checked) {
            selectedMembers[index] = true
        } else {
            selectedMembers[index] = false
        }
        showResults()
    })
})

// Creation-date Handler
creationDateRange.noUiSlider.on('update', function (values) {
    // Show values
    minValueCreation.textContent = Math.round(values[0]);
    maxValueCreation.textContent = Math.round(values[1]);

    // Save values
    creationDateRangeValue.min = Math.round(values[0]);
    creationDateRangeValue.max = Math.round(values[1]);

    showResults()
});

// firstAlbum Handler
firstAlbumRange.noUiSlider.on('update', function (values) {
    // Show values
    minValueAlbum.textContent = Math.round(values[0]);
    maxValueAlbum.textContent = Math.round(values[1]);

    // Save values
    firstAlbumRangeValue.min = Math.round(values[0]);
    firstAlbumRangeValue.max = Math.round(values[1]);

    showResults()
});

// Reset Filters
function reset() {
    location.reload()
}