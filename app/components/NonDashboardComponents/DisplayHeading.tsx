// app/components/NonDashboardComponents/DisplayHeading.tsx

import { Typography, TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const DisplayHeading = styled((props: TypographyProps) => (
  <Typography component="h1" {...props} />
))(() => ({
  fontWeight: "700",
  fontSize: "32px",
  lineHeight: "40px",
  textAlign: "center",
  color: "#111827",
}));

export default DisplayHeading;
