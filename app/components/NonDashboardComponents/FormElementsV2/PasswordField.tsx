// app/components/NonDashboardComponents/FormElementsV2/PasswordField.tsx

import { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  TextFieldProps,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const PasswordField = (props: TextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      fullWidth
      autoComplete="off"
      type={showPassword ? "text" : "password"}
      variant="outlined"
      InputLabelProps={{ shrink: false }}
      sx={{
        ".MuiOutlinedInput-root": {
          borderRadius: "6px",
          fontSize: "14px",
          color: "#111827",
          fontWeight: "500",
          boxShadow: "0px 1px 2px 0px #1018280D",
          "& .MuiOutlinedInput-input": {
            padding: "10px 12px",
            backgroundColor: "#FFF",
            "&::placeholder": {
              fontSize: "14px",
              color: "#9CA3AF",
            },
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#D1D5DB",
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default PasswordField;
