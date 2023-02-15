import Select from "react-select";

export default function GroupSelect({ options, ...rest }) {
  const customStyle = {
    //   hide prompts and indicators
    noOptionsMessage: () => null,
    components: {
      DropdownIndicator: () => null,
      IndicatorSeparator: () => null,
    },
    styles: {
      control: (provided, state) => ({
        ...provided,
        "borderRadius": "2rem",
        "borderColor": "rgb(111, 208, 178)",
        "boxShadow": state.isFocused ? "0 0 0 0.25rem rgba(111, 208, 178, 0.25)" : "none",
        ":hover": {
          borderColor: "rgb(111, 208, 178)",
        },
      }),
      singleValue: (provided, state) => ({
        ...provided,
        color: "#48569e",
      }),
    },
  };

  return <Select options={options} {...rest} {...customStyle} />;
}
