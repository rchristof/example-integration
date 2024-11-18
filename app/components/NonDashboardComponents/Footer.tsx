import { Box, Typography } from "@mui/material";
import Link from "next/link";

interface FooterProps {
  orgName: string;
}

const Footer = ({ orgName }: FooterProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px 0",
        backgroundColor: "#f7f9fc",
      }}
    >
      <Typography
        fontWeight="500"
        fontSize="14px"
        lineHeight="22px"
        color="#A0AEC0"
        textAlign="center"
        mb="8px"
      >
        © {new Date().getFullYear()} {orgName}. All rights reserved.
      </Typography>
      <Box display="flex" gap="16px" justifyContent="center">
        <Link
          href="/terms-of-use"
          style={{
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "22px",
            color: "#111827",
          }}
        >
          Terms & Conditions
        </Link>
        <Link
          href="/privacy-policy"
          style={{
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "22px",
            color: "#111827",
          }}
        >
          Privacy Policy
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
