import Head from "next/head";
import { Box } from "@mui/material";
import Footer from "../Footer";
import Logo from "../Logo";

interface MainImageLayoutProps {
  orgName: string;
  orgLogoURL: string;
  pageTitle?: string;
  children: React.ReactNode;
  contentMaxWidth?: number;
}

const MainImageLayout = ({
  orgName,
  orgLogoURL,
  pageTitle,
  children,
  contentMaxWidth = 480,
}: MainImageLayoutProps) => {
  return (
    <>
      {pageTitle && (
        <Head>
          <title>{pageTitle}</title>
        </Head>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f7f9fc",
          padding: "20px",
        }}
      >
        
        <Box
          sx={{
            maxWidth: contentMaxWidth,
            width: "100%",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {orgLogoURL && (
            <Box mb={1}>
              <Logo src={orgLogoURL} alt={orgName} />
            </Box>
          )}
          {children}
        </Box>
        <Footer orgName={orgName} />
      </Box>
    </>
  );
};

export default MainImageLayout;
