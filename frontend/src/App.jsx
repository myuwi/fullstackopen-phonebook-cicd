import { useEffect, useState, useRef } from "react";
import personService from "./services/persons";

import Filter from "./components/Filter";
import Notification from "./components/Notification";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [notification, setNotification] = useState(null);
  const notificationHideTimeout = useRef(null);

  const filteredPersons = persons.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase()),
  );

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const showNotification = (data) => {
    // Cancel existing notification hide timeout when a new notification
    // is created so old timeout doesn't hide the new notification
    if (notificationHideTimeout.current) {
      clearTimeout(notificationHideTimeout.current);
    }

    setNotification(data);

    notificationHideTimeout.current = setTimeout(() => {
      setNotification(null);
      notificationHideTimeout.current = null;
    }, 5000);
  };

  const addPerson = (e) => {
    e.preventDefault();
    const newPerson = {
      name: newName,
      number: newNumber,
    };

    const oldPerson = persons.find((p) => p.name === newName);

    if (oldPerson) {
      const confirmed = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`,
      );

      if (confirmed) {
        personService
          .update(oldPerson.id, newPerson)
          .then((updatedPerson) => {
            const newPersons = persons.map((person) =>
              person.id !== updatedPerson.id ? person : updatedPerson,
            );
            setPersons(newPersons);
            showNotification({
              message: `Updated ${newPerson.name}`,
              type: "success",
            });
            setNewName("");
            setNewNumber("");
          })
          .catch((err) => {
            if (err?.response?.status === 404) {
              setPersons(
                persons.filter((person) => person.id !== oldPerson.id),
              );
              showNotification({
                message: `Information of ${oldPerson.name} has already been removed from server`,
                type: "error",
              });
            } else {
              showNotification({
                message: err?.response?.data?.error || "Failed to update",
                type: "error",
              });
            }
          });
      }
      return;
    }

    personService
      .create(newPerson)
      .then((person) => {
        setPersons(persons.concat(person));
        showNotification({
          message: `Added ${newPerson.name}`,
          type: "success",
        });
        setNewName("");
        setNewNumber("");
      })
      .catch((err) => {
        showNotification({
          message: err?.response?.data?.error || "Failed to add",
          type: "error",
        });
      });
  };

  const deletePerson = (person) => {
    if (window.confirm(`Delete ${person.name}?`)) {
      personService.delete(person.id);
      setPersons(persons.filter((p) => p.id !== person.id));
      showNotification({
        message: `Deleted ${person.name}`,
        type: "success",
      });
    }
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleNumberChange = (e) => {
    setNewNumber(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notification={notification} />
      <Filter value={filter} onChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons persons={filteredPersons} deletePerson={deletePerson} />
    </div>
  );
};

export default App;
