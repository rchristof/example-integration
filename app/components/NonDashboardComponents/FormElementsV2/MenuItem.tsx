import { styled } from "@mui/material";
import MuiMenuItem, { menuItemClasses } from "@mui/material/MenuItem";

const MenuItem = styled(MuiMenuItem)(() => ({
  borderRadius: 6,
  padding: "10px 8px",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#101828",
  "&+&": {
    marginTop: "4px",
  },
  [`&.${menuItemClasses.selected}`]: {
    backgroundColor: "#F4F4F4 !important",
  },
}));

export default MenuItem;