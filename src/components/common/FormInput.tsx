import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

const FormInput = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  return (
    <TextField
      {...props}
      ref={ref}
      fullWidth
      margin="normal"
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: 'primary.main',
          },
        },
      }}
    />
  );
});

FormInput.displayName = 'FormInput';

export default FormInput; 