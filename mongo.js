import mongoose from "mongoose";

const password = process.argv[2];

if (!password) {
  console.log("give password as argument");
  process.exit(1);
}

const url = `mongodb+srv://myuwi:${password}@phonebook.pjadrwj.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const name = process.argv[3];
const number = process.argv[4];

if (!name || !number) {
  Person.find({}).then((persons) => {
    console.log("phonebook:");
    persons.forEach((person) => console.log(`${person.name} ${person.number}`));
    mongoose.connection.close();
  });
} else {
  const person = new Person({ name, number });

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
