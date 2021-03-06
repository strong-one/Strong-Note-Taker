const express = require("express");
const path = require("path");
const fs = require("fs");
// forces functions to return a promise
const util = require("util");
// module that generates a unique id automatically
const { v4: uuidv4 } = require("uuid");

// calling express as a function -- generates a new app that represents a running express app. essensially an app object used to set up configuration that will listen for incoming requests
const app = express();

// process dot notation is when uploading to third party server, it will accept any any port it provides OR the port thay I provided
const PORT = process.env.PORT || 1992;

// enable server to accept requests
// middleware vvv
app.use(express.json()); // json objs from the user
app.use(express.urlencoded({ extended: true })); //arrays and strings from the user

// make public assests available to front end
app.use(express.static("public"));

// populate new notes in to new object that will be saved and displayed to html

// get route to first page
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// get route to second page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

// util.promisify = forces a function that normally does not return promise to return a promise
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const getNotes = () => {
  // reading file asyncronously from a file and formatting it to user readable
  return readFileAsync("db/db.json", "utf8").then((notes) => {
    // returning the read file into an object (parse)
    return JSON.parse(notes);
  });
};

// get notes from the api
app.get("/api/notes", (req, res) => {
  getNotes().then((notes) => {
    res.json(notes);
  });
});

// create notes
app.post("/api/notes", (req, res) => {
  // post new notes in body of html
  const newNote = req.body;

  newNote.id = uuidv4(); // create a key that will generate a unique id to new note

  getNotes().then((notes) => {
    // storing notes in to a var called allNotes
    const allNotes = notes;
    // notes(allNotes) push into a newNote which will request to push into body of html
    allNotes.push(newNote);
    // returning what was pulled from the db.json file, returning the json as a string from allNotes
    return writeFileAsync("db/db.json", JSON.stringify(allNotes)).then(() => {
      // then the response is a new note of user input in the body of the html
      res.json(newNote);
    });
  });
});

// delete notes
app.delete("/api/notes/:id", (req, res) => {
  // which request am I looking for? paramater of ID
  const id = req.params.id;

  getNotes().then((notes) => {
    // filtering the note with the matching id and keeping everything else. true - keep note in -- false - remove note
    const allNotes = notes.filter((note) => id !== note.id);
    return writeFileAsync("db/db.json", JSON.stringify(allNotes)).then(() => {
      res.json({ id: id });
    });
  });
});

// activating port 1992 to listen to requests
app.listen(PORT, () => console.log(`App listening on PORT: ${PORT}`));
