// app/components/NonDashboardComponents/Logo.tsx

import styled from "@emotion/styled";

interface LogoProps {
  src: string;
  alt: string;
}

const StyledLogo = styled("img")(() => ({
  width: 142,
  height: "auto",
}));

const Logo = ({ src, alt }: LogoProps) => {
  return <StyledLogo src={src} alt={alt} />;
};

export default Logo;
