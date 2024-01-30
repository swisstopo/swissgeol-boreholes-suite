import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { getInputFieldBackgroundColor } from "./form";
import CancelIcon from "@mui/icons-material/Cancel";
import { Chip, Stack } from "@mui/material";

export const FormMultiSelect = props => {
  const { fieldName, label, required, disabled, selected, sx } = props;
  const { t } = useTranslation();
  const { formState, register, setValue } = useFormContext();

  //   const ChipBox = (selection, field) => {
  //     const handleDelete = valueToDelete => {
  //       const updatedValues = field.value.filter(
  //         value => value !== valueToDelete,
  //       );
  //       field.onChange(updatedValues);
  //       setHydrotestKindIds(updatedValues);

  //       if (updatedValues.length === 0) {
  //         resetRelatedFormValues();
  //         formMethods.trigger();
  //       }
  //     };
  //     return (
  //       <Box
  //         sx={{
  //           display: "flex",
  //           flexWrap: "wrap",
  //           gap: 0.5,
  //         }}>
  //         {selection.map(selectedValue => {
  //           const selectedOption = domains?.data?.find(
  //             option => option.id === selectedValue,
  //           );
  //           return (
  //             <Chip
  //               key={selectedValue}
  //               label={
  //                 selectedOption ? selectedOption[i18n.language] : selectedValue
  //               }
  //               deleteIcon={
  //                 <CancelIcon
  //                   onMouseDown={e => e.stopPropagation()}
  //                   onMouseOver={() => handleDeleteHover(field)}
  //                 />
  //               }
  //               onClick={e => e.stopPropagation()}
  //               onDelete={e => {
  //                 e.stopPropagation();
  //                 handleDelete(selectedValue);
  //               }}
  //             />
  //           );
  //         })}
  //       </Box>
  //     );
  //   };

  return (
    <TextField
      select
      name={fieldName}
      required={required || false}
      sx={{
        backgroundColor: getInputFieldBackgroundColor(
          formState.errors[fieldName],
        ),
        borderRadius: "4px",
        flex: "1",
        marginTop: "10px !important",
        marginRight: "10px !important",
        ...sx,
      }}
      size="small"
      label={t(label)}
      variant="outlined"
      {...register(fieldName, {
        required: required || false,
        onChange: e => {
          setValue(fieldName, e.target.value, { shouldValidate: true });
        },
      })}
      defaultValue={selected || ""}
      disabled={disabled || false}
      data-cy={fieldName + "-formSelect"}
      InputLabelProps={{ shrink: true }}
      multiple
      renderValue={selected => (
        <Stack gap={1} direction="row" flexWrap="wrap">
          {selected.map(value => (
            <Chip
              key={value}
              label={value}
              onDelete={
                () => console.log("delete", value)
                // setSelectedNames(selectedNames.filter(item => item !== value))
              }
              deleteIcon={
                <CancelIcon onMouseDown={event => event.stopPropagation()} />
              }
            />
          ))}
        </Stack>
      )}>
      {props.children}
    </TextField>
  );
};
