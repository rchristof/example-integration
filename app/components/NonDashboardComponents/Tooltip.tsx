import { styled } from "@mui/material";
import MuiTooltip, { tooltipClasses } from "@mui/material/Tooltip";

const Tooltip = styled(
  ({ className, ...props }) => (
    <MuiTooltip {...props} arrow classes={{ popper: className }} />
  ),
  {
    shouldForwardProp: (prop) => prop !== "isVisible",
  }
)(({ theme, isVisible = true }) => ({
  display: isVisible ? "block" : "none",
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#101828",
    fontSize: "12px",
    lineHeight: "18px",
    fontWeight: 600,
    padding: "12px",
    borderRadius: "8px",
  },
}));

export default Tooltip;

export const WhiteTooltip = styled(({ className, ...props }) => (
  <MuiTooltip
    placement="bottom"
    {...props}
    arrow
    classes={{ popper: className }}
  />
))(({ isVisible = true }) => ({
  display: isVisible ? "block" : "none",
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#FFF",
    color: "#000000",
    fontSize: "14px",
    fontWeight: "400",
    border: "1px solid",
    borderRadius: "4px",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#fff",
  },
}));