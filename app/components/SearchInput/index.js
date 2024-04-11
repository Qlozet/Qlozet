const SearchInput = ({ label, setValue, value, rightIcon, leftIcon }) => {
  return (
    <div>
      {leftIcon}
      <input></input>
      {rightIcon}
    </div>
  );
};

export default SearchInput;
