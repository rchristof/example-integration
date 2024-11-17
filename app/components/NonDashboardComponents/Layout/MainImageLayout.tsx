// app/components/NonDashboardComponents/Layout/MainImageLayout.tsx

import Head from "next/head";
import Image from "next/image";
import { Box } from "@mui/material";
import Footer from "../Footer";
import Logo from "../Logo";
import CurvedArrow from "../Icons/CurvedArrow"; // Se você tiver este componente

interface MainImageLayoutProps {
  orgName: string;
  orgLogoURL: string;
  pageTitle?: string;
  showArrow?: boolean;
  children: React.ReactNode;
  contentMaxWidth?: number;
}

const MainImageLayout = ({
  orgName,
  orgLogoURL,
  pageTitle,
  showArrow,
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
      <Box display="grid" gridTemplateColumns="1fr 1fr" height="100vh">
        {/* Caixa de Imagem */}
        <Box
          p="50px 36px"
          sx={{
            display: "grid",
            placeItems: "center",
            boxShadow: "0px 12px 16px -4px #10182814",
          }}
        >
          <Image
            src="/assets/images/non-dashboard/signin-main.svg" // Verifique o caminho da imagem
            alt="Hero Image"
            width={646}
            height={484}
            style={{ maxWidth: "800px", height: "auto" }}
            priority
          />
        </Box>
        <Box
          sx={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            padding: "24px 55px 60px",
          }}
        >
          <Box maxWidth={contentMaxWidth} width="100%" mx="auto">
            {/* Logo */}
            <Box position="relative" textAlign="center">
              {showArrow && (
                <CurvedArrow
                  style={{ position: "absolute", top: "-80px", left: "0px" }}
                />
              )}
              {orgLogoURL ? <Logo src={orgLogoURL} alt={orgName} /> : null}
            </Box>
            {children}
          </Box>
          <Footer orgName={orgName} />
        </Box>
      </Box>
    </>
  );
};

export default MainImageLayout;
