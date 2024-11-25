const Person = ({ data, deletePerson }) => {
  const handleDelete = () => deletePerson(data);

  return (
    <div>
      {data.name} {data.number} <button onClick={handleDelete}>delete</button>
    </div>
  );
};

export default Person;
