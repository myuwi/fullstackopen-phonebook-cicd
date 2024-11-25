import Person from "./Person";

const Persons = ({ persons, deletePerson }) => {
  return (
    <div>
      {persons.map((person) => (
        <Person key={person.name} data={person} deletePerson={deletePerson} />
      ))}
    </div>
  );
};

export default Persons;
